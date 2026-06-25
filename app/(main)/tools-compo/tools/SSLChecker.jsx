"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Server,
  Network,
  Hash,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Eye,
  Link2,
  Building2,
  Wifi,
  KeyRound,
  FileKey,
  ListChecks,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─────────────────────────────────────────────
// Mini helper: Copy button with flash feedback
// ─────────────────────────────────────────────
function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label || "Value"} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

// ─────────────────────────────────────────────
// Days-remaining badge with colour coding
// ─────────────────────────────────────────────
function DaysBadge({ days }) {
  if (days === null) return null;
  let color = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30";
  if (days < 0) color = "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30";
  else if (days < 14) color = "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30";
  else if (days < 30) color = "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30";
  else if (days < 90) color = "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30";

  const label = days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining`;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>
      <Clock size={11} />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Individual info-row
// ─────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, copyable, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-800/60 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={14} className="text-gray-400 flex-shrink-0" />}
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`text-xs text-gray-800 dark:text-gray-200 break-all text-right ${
            mono ? "font-mono" : "font-medium"
          }`}
        >
          {value}
        </span>
        {copyable && <CopyBtn text={value} label={label} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section card container
// ─────────────────────────────────────────────
function SectionCard({ title, icon: Icon, iconColor = "text-indigo-500", children, badge }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <span className={`${iconColor}`}>
          <Icon size={16} />
        </span>
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex-1">{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Format date helper
// ─────────────────────────────────────────────
function fmtDate(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// ─────────────────────────────────────────────
// Security score calculator
// ─────────────────────────────────────────────
function calcSecurityScore(data) {
  let score = 0;
  const checks = [];

  // Valid cert
  if (data.isValid) {
    score += 25;
    checks.push({ label: "Certificate is trusted", pass: true });
  } else {
    checks.push({ label: "Certificate is not trusted", pass: false });
  }

  // Not expired
  if (!data.isExpired) {
    score += 20;
    checks.push({ label: "Certificate is not expired", pass: true });
  } else {
    checks.push({ label: "Certificate is expired", pass: false });
  }

  // Days remaining
  if (data.daysRemaining !== null && data.daysRemaining >= 30) {
    score += 15;
    checks.push({ label: "More than 30 days until expiry", pass: true });
  } else {
    checks.push({ label: "Less than 30 days until expiry", pass: data.daysRemaining >= 30 });
  }

  // Chain depth indicates proper CA chain
  if (data.chainDepth >= 2) {
    score += 15;
    checks.push({ label: "Has full certificate chain", pass: true });
  } else {
    checks.push({ label: "Has full certificate chain", pass: false });
  }

  // Strong protocol
  const strongProtocols = ["TLSv1.2", "TLSv1.3"];
  const isStrongProtocol = strongProtocols.some((p) =>
    (data.protocol || "").includes(p)
  );
  if (isStrongProtocol) {
    score += 15;
    checks.push({ label: `Strong protocol (${data.protocol})`, pass: true });
  } else {
    checks.push({ label: `Weak/outdated protocol (${data.protocol})`, pass: false });
  }

  // OV or EV cert
  if (data.certType !== "DV (Domain Validation)") {
    score += 10;
    checks.push({ label: `Higher assurance certificate (${data.certType})`, pass: true });
  } else {
    checks.push({ label: "Domain Validation only (lower assurance)", pass: false });
  }

  return { score, checks };
}

function scoreColor(score) {
  if (score >= 80) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", label: "Excellent" };
  if (score >= 60) return { text: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500", label: "Good" };
  if (score >= 40) return { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500", label: "Fair" };
  return { text: "text-red-600 dark:text-red-400", bg: "bg-red-500", label: "Poor" };
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function SSLChecker() {
  const [domain, setDomain] = useState("");
  const [port, setPort] = useState("443");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeSanPage, setActiveSanPage] = useState(0);
  const SANS_PER_PAGE = 12;

  const handleCheck = async (e) => {
    e?.preventDefault();
    const trimmed = domain.trim();
    if (!trimmed) {
      setError("Please enter a domain name.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setShowAdvanced(false);
    setActiveSanPage(0);

    try {
      const response = await fetch("/api/check-ssl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed, port: parseInt(port) || 443 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve certificate data.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCheck(e);
  };

  // Examples
  const examples = ["google.com", "github.com", "cloudflare.com", "letsencrypt.org"];

  return (
    <ToolPageShell widthClassName="max-w-5xl" className="px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 self-start">
            <Shield size={12} /> Security Tool
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            SSL Certificate Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Instantly inspect any domain's SSL/TLS certificate. View validity status, expiry dates, issuer details, Subject Alternative Names (SANs), and a full chain of trust — plus security scoring and protocol analysis in Advanced Options.
          </p>
        </div>

        {/* ── Search Form ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter domain (e.g., google.com)"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative w-full sm:w-28">
              <Server size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="Port"
                min={1}
                max={65535}
                className="w-full pl-9 pr-3 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Checking…
                </>
              ) : (
                <>
                  <Search size={16} />
                  Check SSL
                </>
              )}
            </button>
          </form>

          {/* Quick examples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Try:</span>
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setDomain(ex);
                  setPort("443");
                }}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition-colors font-mono cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-red-700 dark:text-red-400"
            >
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">Error</span>
                <span className="text-xs leading-relaxed">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading skeleton ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-6"
            >
              {/* ── Status Hero Banner ── */}
              <div
                className={`rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border shadow-sm ${
                  result.isExpired
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                    : result.isValid
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                    : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
                }`}
              >
                <div
                  className={`p-4 rounded-xl flex-shrink-0 ${
                    result.isExpired
                      ? "bg-red-100 dark:bg-red-900/30"
                      : result.isValid
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-orange-100 dark:bg-orange-900/30"
                  }`}
                >
                  {result.isExpired ? (
                    <ShieldX size={32} className="text-red-600 dark:text-red-400" />
                  ) : result.isValid ? (
                    <ShieldCheck size={32} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ShieldAlert size={32} className="text-orange-600 dark:text-orange-400" />
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono">
                      {result.domain}
                    </h2>
                    {result.resolvedIp && (
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {result.resolvedIp}
                      </span>
                    )}
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      :{result.port}
                    </span>
                  </div>

                  <p
                    className={`text-sm font-bold ${
                      result.isExpired
                        ? "text-red-700 dark:text-red-400"
                        : result.isValid
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}
                  >
                    {result.isExpired
                      ? "⚠ Certificate has expired — site may not be secure!"
                      : result.isValid
                      ? "✓ SSL certificate is valid and trusted"
                      : `⚠ Certificate issue: ${result.authorizationError || "Untrusted"}`}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-1">
                    <DaysBadge days={result.daysRemaining} />
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      <FileKey size={11} />
                      {result.certType}
                    </span>
                    {result.isWildcard && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        <Link2 size={11} />
                        Wildcard Cert
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Core Details Grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Validity */}
                <SectionCard title="Validity Period" icon={Calendar} iconColor="text-emerald-500">
                  <InfoRow icon={Calendar} label="Valid From" value={fmtDate(result.validFrom)} />
                  <InfoRow icon={Calendar} label="Valid To" value={fmtDate(result.validTo)} />
                  <InfoRow
                    icon={Clock}
                    label="Days Remaining"
                    value={
                      result.daysRemaining !== null
                        ? result.daysRemaining < 0
                          ? `Expired (${Math.abs(result.daysRemaining)} days ago)`
                          : `${result.daysRemaining} days`
                        : null
                    }
                  />
                </SectionCard>

                {/* Issuer */}
                <SectionCard title="Certificate Issuer" icon={Building2} iconColor="text-blue-500">
                  <InfoRow icon={Building2} label="Issuer CN" value={result.issuerCN} />
                  <InfoRow icon={Building2} label="Issuer Org" value={result.issuerOrg} />
                  <InfoRow icon={FileKey} label="Cert Type" value={result.certType} />
                </SectionCard>

                {/* Subject */}
                <SectionCard title="Subject" icon={Globe} iconColor="text-purple-500">
                  <InfoRow icon={Globe} label="Common Name" value={result.commonName} />
                  <InfoRow icon={Building2} label="Organization" value={result.organization} />
                  <InfoRow icon={Building2} label="Org. Unit" value={result.organizationalUnit} />
                  <InfoRow icon={Globe} label="Country" value={result.country} />
                </SectionCard>

                {/* Technical Info */}
                <SectionCard title="Connection" icon={Lock} iconColor="text-indigo-500">
                  <InfoRow icon={Network} label="Resolved IP" value={result.resolvedIp} copyable mono />
                  <InfoRow icon={Wifi} label="Protocol" value={result.protocol} />
                  <InfoRow icon={KeyRound} label="Cipher Suite" value={result.cipherName} mono />
                  <InfoRow icon={Hash} label="Serial Number" value={result.serialNumber} mono copyable />
                </SectionCard>
              </div>

              {/* ── SANs panel ── */}
              {result.sans?.length > 0 && (
                <SectionCard
                  title="Subject Alternative Names"
                  icon={ListChecks}
                  iconColor="text-teal-500"
                  badge={
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400 px-2 py-0.5 rounded-full">
                      {result.sanCount}
                    </span>
                  }
                >
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.sans
                      .slice(activeSanPage * SANS_PER_PAGE, (activeSanPage + 1) * SANS_PER_PAGE)
                      .map((san, i) => (
                        <button
                          key={i}
                          onClick={() => { navigator.clipboard.writeText(san); toast.success("SAN copied!"); }}
                          className="text-xs font-mono bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title={`Click to copy: ${san}`}
                        >
                          {san}
                        </button>
                      ))}
                  </div>
                  {result.sans.length > SANS_PER_PAGE && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setActiveSanPage((p) => Math.max(0, p - 1))}
                        disabled={activeSanPage === 0}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 font-medium cursor-pointer"
                      >
                        ← Prev
                      </button>
                      <span className="text-xs text-gray-500 my-auto">
                        Page {activeSanPage + 1} / {Math.ceil(result.sans.length / SANS_PER_PAGE)}
                      </span>
                      <button
                        onClick={() =>
                          setActiveSanPage((p) =>
                            Math.min(Math.ceil(result.sans.length / SANS_PER_PAGE) - 1, p + 1)
                          )
                        }
                        disabled={activeSanPage >= Math.ceil(result.sans.length / SANS_PER_PAGE) - 1}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40 font-medium cursor-pointer"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* ── Advanced Options Toggle ── */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm cursor-pointer select-none group"
              >
                <span className="flex items-center gap-3 text-sm md:text-base">
                  <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Eye size={18} />
                  </span>
                  Advanced Options
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    — Security Score · Fingerprints · Certificate Chain · Protocol Details
                  </span>
                </span>
                <span>{showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
              </button>

              {/* ── Advanced Panel ── */}
              <AnimatePresence initial={false}>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-6 pt-2">
                      {/* Security Score */}
                      {(() => {
                        const { score, checks } = calcSecurityScore(result);
                        const sc = scoreColor(score);
                        return (
                          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                              <Zap size={16} className="text-yellow-500" />
                              <h3 className="text-sm font-bold text-gray-800 dark:text-white">Security Score</h3>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                              {/* Circular score */}
                              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div className="relative w-24 h-24">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                      cx="50" cy="50" r="42"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="10"
                                      className="text-gray-100 dark:text-gray-800"
                                    />
                                    <circle
                                      cx="50" cy="50" r="42"
                                      fill="none"
                                      strokeWidth="10"
                                      strokeLinecap="round"
                                      stroke="currentColor"
                                      strokeDasharray={`${2 * Math.PI * 42}`}
                                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
                                      className={sc.text}
                                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-2xl font-black ${sc.text}`}>{score}</span>
                                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">/100</span>
                                  </div>
                                </div>
                                <span className={`text-sm font-bold ${sc.text}`}>{sc.label}</span>
                              </div>

                              {/* Checks list */}
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {checks.map((c, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    {c.pass ? (
                                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                                    ) : (
                                      <XCircle size={14} className="text-red-500 flex-shrink-0" />
                                    )}
                                    <span
                                      className={
                                        c.pass
                                          ? "text-gray-700 dark:text-gray-300"
                                          : "text-red-600 dark:text-red-400"
                                      }
                                    >
                                      {c.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Protocol & Cipher Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <SectionCard title="TLS Protocol & Cipher" icon={Lock} iconColor="text-indigo-500">
                          <InfoRow icon={Wifi} label="Protocol" value={result.protocol} />
                          <InfoRow icon={KeyRound} label="Cipher Name" value={result.cipherName} mono copyable />
                          <InfoRow icon={KeyRound} label="Cipher Version" value={result.cipherVersion} />
                          {result.keyBits && (
                            <InfoRow icon={KeyRound} label="Key Strength" value={`${result.keyBits}-bit`} />
                          )}
                          <div className="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
                            {(result.protocol?.includes("TLSv1.3") || result.protocol?.includes("TLSv1.2")) ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 size={12} /> Strong protocol in use
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                                <XCircle size={12} /> Outdated protocol — upgrade recommended
                              </span>
                            )}
                          </div>
                        </SectionCard>

                        {/* Fingerprints */}
                        <SectionCard title="Certificate Fingerprints" icon={Hash} iconColor="text-orange-500">
                          <div className="flex flex-col gap-3">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SHA-1</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all flex-1 leading-relaxed">
                                  {result.fingerprint}
                                </span>
                                <CopyBtn text={result.fingerprint} label="SHA-1 Fingerprint" />
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SHA-256</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all flex-1 leading-relaxed">
                                  {result.fingerprint256}
                                </span>
                                <CopyBtn text={result.fingerprint256} label="SHA-256 Fingerprint" />
                              </div>
                            </div>
                          </div>
                        </SectionCard>
                      </div>

                      {/* Certificate Chain */}
                      {result.chain?.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-5">
                            <Layers size={16} className="text-blue-500" />
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex-1">
                              Certificate Chain
                            </h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              {result.chainDepth} certificates
                            </span>
                          </div>

                          <div className="flex flex-col gap-4">
                            {result.chain.map((cert, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="flex flex-col items-center gap-0">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                                      i === 0
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                        : i === result.chain.length - 1
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                    }`}
                                  >
                                    {i === 0 ? "🔒" : i === result.chain.length - 1 ? "⚓" : i + 1}
                                  </div>
                                  {i < result.chain.length - 1 && (
                                    <div className="w-0.5 flex-1 min-h-4 bg-gray-200 dark:bg-gray-700 mt-1" />
                                  )}
                                </div>

                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 mb-1 border border-gray-100 dark:border-gray-800">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                      {cert.cn}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      {i === 0 ? "End-Entity" : i === result.chain.length - 1 ? "Root CA" : "Intermediate CA"}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono break-all">
                                    Issued by: {cert.issuerCn}
                                  </div>
                                  {cert.validFrom && cert.validTo && (
                                    <div className="text-[10px] text-gray-400 mt-1">
                                      {new Date(cert.validFrom).toLocaleDateString()} → {new Date(cert.validTo).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw details for power users */}
                      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Info size={16} className="text-gray-400" />
                          <h3 className="text-sm font-bold text-gray-800 dark:text-white">Complete Subject Details</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow icon={Globe} label="Full Subject" value={result.subject} mono copyable />
                          <InfoRow icon={Building2} label="Full Issuer" value={result.issuer} mono copyable />
                          <InfoRow icon={Hash} label="Serial" value={result.serialNumber} mono copyable />
                          <InfoRow icon={Network} label="Resolved IP" value={result.resolvedIp} mono copyable />
                          <InfoRow icon={Server} label="Port" value={String(result.port)} />
                          <InfoRow icon={ListChecks} label="SAN Count" value={String(result.sanCount)} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── How It Works info bar ── */}
        {!result && !loading && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100 dark:border-emerald-900/40 p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Info size={16} className="text-emerald-500" /> How the SSL Checker Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Search,
                  title: "1. Enter a Domain",
                  desc: "Type any domain name (e.g., google.com) — the tool connects directly over TLS to retrieve the live certificate.",
                },
                {
                  icon: Shield,
                  title: "2. Inspect Results",
                  desc: "View issuer, validity dates, certificate type (DV/OV/EV), and Subject Alternative Names (SANs) at a glance.",
                },
                {
                  icon: Eye,
                  title: "3. Advanced Details",
                  desc: "Click 'Advanced Options' to reveal security scoring, cipher suites, SHA fingerprints, and the full certificate chain.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
}
