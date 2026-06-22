"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Globe,
  Network,
  Clock,
  Coins,
  Copy,
  Share2,
  FileText,
  AlertCircle,
  Shield,
  ShieldAlert,
  Server,
  Smartphone,
  Check,
  Code,
  Map,
  Compass,
  ArrowRight
} from "lucide-react";

export default function IPChecker() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [showJson, setShowJson] = useState(false);
  
  // Real-time clock logic for target timezone
  useEffect(() => {
    if (!result?.timezone || result.timezone === "Unknown") {
      setLocalTime("");
      return;
    }

    const updateClock = () => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: result.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setLocalTime(formatter.format(new Date()));
      } catch (err) {
        console.error("Error updating timezone clock:", err);
        setLocalTime(new Date().toLocaleTimeString());
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [result?.timezone]);

  // Load client IP on mount or check for URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("ip") || params.get("query");
    
    if (urlQuery) {
      setQuery(urlQuery);
      fetchIpInfo(urlQuery);
    } else {
      fetchIpInfo(""); // Load current user IP
    }
  }, []);

  const fetchIpInfo = async (searchQuery) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/check-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch IP details");
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to load IP details");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a valid IP address or domain");
      return;
    }
    fetchIpInfo(query.trim());
  };

  const handleMyIp = () => {
    setQuery("");
    fetchIpInfo("");
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleShareLink = () => {
    if (!result) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?query=${encodeURIComponent(result.ip)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const downloadTextReport = () => {
    if (!result) return;
    const report = `IP Checker Report
--------------------------------------
IP Address: ${result.ip} (${result.version})
Domain/Host Resolved: ${result.resolvedFrom || "None"}
Location: ${result.city}, ${result.region}, ${result.country} (${result.countryCode})
Coordinates: Latitude: ${result.latitude}, Longitude: ${result.longitude}
Postal Code: ${result.postal}
Timezone: ${result.timezone} (UTC Offset: ${result.timezoneOffset})
ISP: ${result.isp}
ASN: ${result.asn}
Organization: ${result.org}
Currency: ${result.currency} (${result.currencyCode})
Calling Code: ${result.callingCode}
Security Indicators:
- Proxy/VPN: ${result.isProxy ? "Yes" : "No"}
- Hosting/Server: ${result.isHosting ? "Yes" : "No"}
- Mobile Data: ${result.isMobile ? "Yes" : "No"}
--------------------------------------
Generated via ToolsTrek IP Checker
`;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ip-report-${result.ip}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Text report downloaded!");
  };

  // Safe Google Maps Iframe Source
  const mapSrc = result
    ? `https://maps.google.com/maps?q=${result.latitude},${result.longitude}&t=&z=11&ie=UTF8&iwloc=&output=embed`
    : "";

  return (
    <ToolPageShell widthClassName="max-w-7xl px-4 pt-20 pb-10">
      <div className="space-y-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brandColor to-indigo-600 dark:from-brandColor dark:to-purple-400 bg-clip-text text-transparent">
            IP Checker & Geolocation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Look up any IPv4/IPv6 address or domain server location, network ISP, timezone, and geolocation map instantly.
          </p>
        </div>

        {/* Input & Control Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500">
                <Globe className="w-5 h-5" />
              </span>
              <input
                id="ip-query-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter IP Address (e.g. 8.8.8.8) or Domain (e.g. github.com)"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition outline-none"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <button
                id="search-ip-btn"
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-brandColor hover:bg-brandColorHover text-white font-semibold rounded-2xl shadow-lg shadow-brandColor/25 hover:shadow-brandColor/35 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>Lookup</span>
              </button>
              <button
                id="my-ip-btn"
                type="button"
                onClick={handleMyIp}
                disabled={loading}
                className="px-4 py-3.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                title="Detect my public IP"
              >
                My IP
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-3.5 rounded-2xl flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Localhost Warning Banner */}
        {result?.isLocalhost && (
          <div className="max-w-7xl mx-auto bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Localhost Environment Detected:</span> Geolocation services cannot pinpoint loopback IP addresses (like <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded font-mono">127.0.0.1</code>). Currently displaying simulated results for Google DNS (<code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded font-mono">8.8.8.8</code>).
            </div>
          </div>
        )}

        {/* Loading Spinner Skeleton */}
        {loading && !result && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brandColor border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Fetching secure geolocation records...</p>
          </div>
        )}

        {/* Result Dashboard Layout */}
        {result && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Map & Quick Info Widget (Lg: col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Map Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/40">
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-brandColor" />
                    Geographical Map
                  </h3>
                  <span className="text-xs bg-brandColor/10 text-brandColor dark:bg-brandColor/20 px-2.5 py-1 rounded-full font-mono font-semibold">
                    {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="relative aspect-video sm:aspect-square lg:aspect-auto lg:h-96 w-full bg-gray-100 dark:bg-gray-950">
                  <iframe
                    title="IP Geolocation Map"
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xl shadow-gray-200/40 dark:shadow-black/40 flex flex-wrap gap-3">
                <button
                  id="share-btn"
                  onClick={handleShareLink}
                  className="flex-1 min-w-[140px] py-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl transition duration-200 flex items-center justify-center gap-2 border border-gray-200/50 dark:border-gray-800/80 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-brandColor" />
                  <span>Share IP</span>
                </button>
                <button
                  id="report-btn"
                  onClick={downloadTextReport}
                  className="flex-1 min-w-[140px] py-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl transition duration-200 flex items-center justify-center gap-2 border border-gray-200/50 dark:border-gray-800/80 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Export Report</span>
                </button>
                <button
                  id="toggle-json-btn"
                  onClick={() => setShowJson(!showJson)}
                  className={`flex-1 min-w-[140px] py-3 font-semibold rounded-2xl transition duration-200 flex items-center justify-center gap-2 border cursor-pointer ${
                    showJson
                      ? "bg-brandColor/10 dark:bg-brandColor/25 text-brandColor border-brandColor/35"
                      : "bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-800/80"
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>{showJson ? "Hide JSON" : "Raw JSON"}</span>
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: Geolocation Metrics (Lg: col-span-7) */}
            <div className="lg:col-span-7 space-y-6">

              {/* Main IP & Connection Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/40 dark:shadow-black/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brandColor/80 dark:text-brandColor/90">Target Host Details</span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white break-all">{result.ip}</h2>
                      <button
                        onClick={() => copyToClipboard(result.ip, "IP Address")}
                        className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                        title="Copy IP Address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {result.resolvedFrom && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Resolved from: <span className="font-semibold text-brandColor">{result.resolvedFrom}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl">
                      {result.version}
                    </span>
                    <span className="px-3 py-1.5 bg-brandColor/10 dark:bg-brandColor/25 text-brandColor text-xs font-bold rounded-xl flex items-center gap-1">
                      <Network className="w-3.5 h-3.5" />
                      <span>{result.source}</span>
                    </span>
                  </div>
                </div>

                {/* Grid of Geolocation Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 pt-6">
                  
                  {/* Location card */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Location / Address</p>
                      <p className="text-gray-900 dark:text-white font-bold mt-0.5 truncate">
                        {result.city}, {result.region}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Postal/ZIP: {result.postal}</p>
                    </div>
                  </div>

                  {/* Country Flag details */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800">
                      {result.countryCode ? (
                        <img
                          src={`https://flagcdn.com/w80/${result.countryCode.toLowerCase()}.png`}
                          alt={result.country}
                          className="w-10 h-7 object-cover rounded shadow-xs"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Country</p>
                      <p className="text-gray-900 dark:text-white font-bold mt-0.5 truncate">
                        {result.country} ({result.countryCode})
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Continent: {result.continent}</p>
                    </div>
                  </div>

                  {/* Latitude / Longitude details */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Coordinates</p>
                      <p className="text-gray-900 dark:text-white font-bold mt-0.5 truncate">
                        Lat: {result.latitude.toFixed(5)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Lon: {result.longitude.toFixed(5)}</p>
                    </div>
                  </div>

                  {/* Security / Connection status details */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Security Inspection</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {result.isProxy ? (
                          <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-2xs font-extrabold rounded-md flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            Proxy/VPN
                          </span>
                        ) : null}
                        {result.isHosting ? (
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-2xs font-extrabold rounded-md flex items-center gap-0.5">
                            <Server className="w-2.5 h-2.5" />
                            Hosting/Server
                          </span>
                        ) : null}
                        {result.isMobile ? (
                          <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-400 text-2xs font-extrabold rounded-md flex items-center gap-0.5">
                            <Smartphone className="w-2.5 h-2.5" />
                            Mobile Data
                          </span>
                        ) : null}
                        {!result.isProxy && !result.isHosting && !result.isMobile ? (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-2xs font-extrabold rounded-md flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Residential / Safe
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ISP & Routing Information */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/40 dark:shadow-black/40">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Provider Network Routing
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800/80">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Internet Service Provider (ISP)</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right max-w-[65%] truncate" title={result.isp}>
                      {result.isp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800/80">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Organization (AS Owner)</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right max-w-[65%] truncate" title={result.org}>
                      {result.org}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Autonomous System Number (ASN)</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono text-right truncate">
                      {result.asn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timezone & Local Details */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/40 dark:shadow-black/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Local Time Clock */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brandColor" />
                        Target Timezone clock
                      </span>
                      <p className="text-sm text-gray-800 dark:text-gray-300 font-bold mt-2 truncate">
                        {result.timezone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Offset: {result.timezoneOffset}</p>
                    </div>
                    <div className="mt-4">
                      {localTime ? (
                        <p className="text-3xl font-black text-brandColor font-mono tracking-wide leading-none">{localTime}</p>
                      ) : (
                        <span className="text-xs text-gray-400">Time details unavailable</span>
                      )}
                    </div>
                  </div>

                  {/* Locale Details */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Currency</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {result.currencyCode ? `${result.currencyCode} (${result.currency})` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Dialing Prefix</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {result.callingCode ? result.callingCode : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Local Languages</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[50%] text-right" title={result.languages}>
                        {result.languages ? result.languages : "N/A"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Raw JSON Accordion Viewer */}
              {showJson && (
                <div className="bg-gray-950 text-emerald-400 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl p-5 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-3">
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" />
                      raw_json_response.json
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(result, null, 2), "JSON Response")}
                      className="text-xs bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-gray-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy JSON
                    </button>
                  </div>
                  <pre className="text-xs font-mono overflow-x-auto whitespace-pre p-2 text-emerald-500 select-all max-h-80 scrollbar-thin scrollbar-thumb-gray-800">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          </div>
        )}
        
        {/* Informational Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto pt-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-brandColor" />
              What is my IP Address?
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your IP (Internet Protocol) address is a unique numerical label assigned to each device connected to a computer network. The tool auto-detects either your IPv4 or IPv6 public address.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              How is Geolocation found?
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              IP Geolocation maps IP addresses to geographical locations. Free registries compile coordinates, countries, and ISPs to estimate server and consumer connection placements globally.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Domain IP Resolution
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              When entering a domain name, our tool uses public DNS lookup to map the hostname to its active hosted web server IP before scanning the server's geolocation metrics.
            </p>
          </div>
        </div>

      </div>
    </ToolPageShell>
  );
}
