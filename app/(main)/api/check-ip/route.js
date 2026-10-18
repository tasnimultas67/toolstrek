import { NextResponse } from "next/server";
import dns from "dns";
import net from "net";

// Node.js runtime for raw DNS + request headers.
export const runtime = "nodejs";
export const maxDuration = 30;

const PROVIDER_TIMEOUT_MS = 5000;

// Helper to wrap fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = PROVIDER_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Convert continent code to full name
function getContinentName(code) {
  const names = {
    AF: "Africa",
    AN: "Antarctica",
    AS: "Asia",
    EU: "Europe",
    NA: "North America",
    OC: "Oceania",
    SA: "South America",
  };
  return names[code?.toUpperCase()] || code || "Unknown";
}

// Format seconds offset to +/-HH:MM format
function formatUtcOffset(seconds) {
  const hours = Number(seconds) / 3600;
  if (!Number.isFinite(hours)) return "N/A";
  const absHours = Math.abs(hours);
  const wholeHours = Math.floor(absHours);
  const minutes = Math.round((absHours - wholeHours) * 60);
  const sign = hours >= 0 ? "+" : "-";
  return `${sign}${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Detect if an IP is a private loopback/internal address
function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") return true;

  const parts = ip.split(".");
  if (parts.length === 4) {
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);
    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
  }
  return false;
}

// Read the caller's public IP from platform/proxy headers.
function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    ""
  );
}

// ─────────────────────────────────────────────────────────────
// Geolocation providers. Each entry knows how to build its URL,
// how to tell a usable success apart from a failure, and how to
// normalise its own shape into ToolsTrek's unified schema.
// They are queried in parallel and the first successful one wins,
// so a single provider outage (or datacenter-IP block) never breaks
// the tool.
// ─────────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: "ipwho.is",
    url: (ip) => `https://ipwho.is/${encodeURIComponent(ip)}`,
    isValid: (j) => j && j.success !== false && j.ip,
    map: (d) => ({
      ip: d.ip,
      version: d.type === "IPv6" || String(d.ip).includes(":") ? "IPv6" : "IPv4",
      city: d.city || "Unknown",
      region: d.region || "Unknown",
      regionCode: d.region_code || "",
      country: d.country || "Unknown",
      countryCode: d.country_code || "",
      continent: d.continent || getContinentName(d.continent_code),
      postal: d.postal || "Unknown",
      latitude: parseFloat(d.latitude) || 0,
      longitude: parseFloat(d.longitude) || 0,
      timezone: d.timezone?.id || "Unknown",
      timezoneOffset: d.timezone?.utc ? formatUtcOffset(d.timezone.utc) : "N/A",
      isp: d.connection?.isp || d.connection?.org || "Unknown",
      org: d.connection?.org || "Unknown",
      asn: d.connection?.asn ? `AS${d.connection.asn}` : "Unknown",
      currency: d.currency?.name || "Unknown",
      currencyCode: d.currency?.code || "",
      callingCode: d.calling_code || "",
      languages: "",
      isProxy: false,
      isHosting: false,
      isMobile: false,
    }),
  },
  {
    id: "freeipapi.com",
    url: (ip) => `https://freeipapi.com/api/json/${encodeURIComponent(ip)}`,
    isValid: (j) => j && j.ipAddress,
    map: (d) => ({
      ip: d.ipAddress,
      version: d.ipVersion === 6 ? "IPv6" : "IPv4",
      city: d.cityName || "Unknown",
      region: d.regionName || "Unknown",
      regionCode: "",
      country: d.countryName || "Unknown",
      countryCode: d.countryCode || "",
      continent: d.continent || "Unknown",
      postal: d.zipCode || "Unknown",
      latitude: parseFloat(d.latitude) || 0,
      longitude: parseFloat(d.longitude) || 0,
      timezone: d.timeZone || "Unknown",
      timezoneOffset: "N/A",
      isp: "Unknown",
      org: "Unknown",
      asn: "Unknown",
      currency: "Unknown",
      currencyCode: "",
      callingCode: "",
      languages: "",
      isProxy: d.isProxy || false,
      isHosting: false,
      isMobile: false,
    }),
  },
  {
    id: "ipapi.co",
    url: (ip) => `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
    isValid: (j) => j && j.ip && !j.error,
    map: (d) => ({
      ip: d.ip,
      version: d.version || (String(d.ip).includes(":") ? "IPv6" : "IPv4"),
      city: d.city || "Unknown",
      region: d.region || "Unknown",
      regionCode: d.region_code || "",
      country: d.country_name || "Unknown",
      countryCode: d.country_code || "",
      continent: getContinentName(d.continent_code),
      postal: d.postal || "Unknown",
      latitude: parseFloat(d.latitude) || 0,
      longitude: parseFloat(d.longitude) || 0,
      timezone: d.timezone || "Unknown",
      timezoneOffset: d.utc_offset || "N/A",
      isp: d.org || d.asn || "Unknown",
      org: d.org || "Unknown",
      asn: d.asn || "Unknown",
      currency: d.currency_name || d.currency || "Unknown",
      currencyCode: d.currency || "",
      callingCode: d.country_calling_code || "",
      languages: d.languages || "",
      isProxy: false,
      isHosting: false,
      isMobile: false,
    }),
  },
  {
    id: "ip-api.com",
    url: (ip) => {
      const fields =
        "status,message,continent,continentCode,country,countryCode,region,regionName,city,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,mobile,proxy,hosting,query";
      return `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`;
    },
    isValid: (j) => j && j.status === "success",
    map: (d) => ({
      ip: d.query,
      version: String(d.query).includes(":") ? "IPv6" : "IPv4",
      city: d.city || "Unknown",
      region: d.regionName || "Unknown",
      regionCode: d.region || "",
      country: d.country || "Unknown",
      countryCode: d.countryCode || "",
      continent: d.continent || "Unknown",
      postal: d.zip || "Unknown",
      latitude: parseFloat(d.lat) || 0,
      longitude: parseFloat(d.lon) || 0,
      timezone: d.timezone || "Unknown",
      timezoneOffset: d.offset !== undefined ? formatUtcOffset(d.offset) : "N/A",
      isp: d.isp || "Unknown",
      org: d.org || "Unknown",
      asn: d.as || "Unknown",
      currency: d.currency || "Unknown",
      currencyCode: d.currency || "",
      callingCode: "",
      languages: "",
      isProxy: d.proxy || false,
      isHosting: d.hosting || false,
      isMobile: d.mobile || false,
    }),
  },
];

// Query every provider at once and return the first (by priority) hit.
async function lookupGeolocation(ip) {
  const attempts = await Promise.allSettled(
    PROVIDERS.map(async (provider) => {
      const res = await fetchWithTimeout(provider.url(ip));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!provider.isValid(json)) throw new Error("Invalid payload");
      return { source: provider.id, data: provider.map(json) };
    })
  );

  for (let i = 0; i < PROVIDERS.length; i++) {
    const attempt = attempts[i];
    if (attempt.status === "fulfilled") {
      return attempt.value;
    }
    console.warn(
      `Geolocation provider ${PROVIDERS[i].id} failed:`,
      attempt.reason?.message || attempt.reason
    );
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { query } = body;
    query = query?.trim() || "";

    // 1. Detect client IP
    let clientIp = getClientIp(request);

    // Clean IP representation (like removing ipv4-mapped ipv6 prefix)
    if (clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.substring(7);
    }

    let targetIp = "";
    let isLocalhost = false;
    let resolvedFrom = "";

    // 2. Determine target IP
    if (!query || query.toLowerCase() === "my-ip") {
      if (!clientIp || isPrivateIp(clientIp)) {
        targetIp = "8.8.8.8"; // Default test IP for local development
        isLocalhost = true;
      } else {
        targetIp = clientIp;
      }
    } else {
      // Check if query is directly an IP
      const ipVersion = net.isIP(query);
      if (ipVersion > 0) {
        targetIp = query;
      } else {
        // Query is a domain. Clean domain structure first
        let cleanDomain = query.replace(/^(https?:\/\/)?(www\.)?/, ""); // Remove protocols
        cleanDomain = cleanDomain.split("/")[0].split(":")[0]; // Strip path, queries, and ports

        try {
          const lookupResult = await dns.promises.lookup(cleanDomain);
          targetIp = lookupResult.address;
          resolvedFrom = cleanDomain;
        } catch (dnsErr) {
          console.error("DNS lookup error:", dnsErr);
          return NextResponse.json(
            { error: `Could not resolve domain name "${cleanDomain}" to an IP address` },
            { status: 400 }
          );
        }
      }
    }

    // 3. Query geolocation services (resilient, parallel)
    const hit = await lookupGeolocation(targetIp);

    if (!hit) {
      return NextResponse.json(
        { error: "Could not retrieve geolocation data for this IP address. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...hit.data,
      isLocalhost,
      resolvedFrom,
      source: hit.source,
    });
  } catch (error) {
    console.error("IP check endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing the request." },
      { status: 500 }
    );
  }
}
