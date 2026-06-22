import { NextResponse } from "next/server";
import dns from "dns";
import net from "net";

// Helper to wrap fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
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
  const hours = seconds / 3600;
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

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { query } = body;
    query = query?.trim() || "";

    // 1. Detect client IP
    let clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
                   request.headers.get("x-real-ip") ||
                   request.ip ||
                   "";

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

    // 3. Query Geolocation Services (Resilient fallback mechanism)
    let data = null;
    let source = "";

    // Attempt 1: Fetch from ipapi.co (rich details, timezone offsets, currency, calling codes)
    try {
      const res = await fetchWithTimeout(`https://ipapi.co/${targetIp}/json/`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.ip && !json.error) {
          data = json;
          source = "ipapi.co";
        }
      }
    } catch (err) {
      console.warn("ipapi.co fetch failed, trying next provider:", err.message);
    }

    // Attempt 2: Fetch from ip-api.com (includes detailed connection flags like proxy/vpn/mobile)
    if (!data) {
      try {
        const fields = "status,message,continent,continentCode,country,countryCode,region,regionName,city,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,mobile,proxy,hosting,query";
        const res = await fetchWithTimeout(`http://ip-api.com/json/${targetIp}?fields=${fields}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.status === "success") {
            data = json;
            source = "ip-api.com";
          }
        }
      } catch (err) {
        console.warn("ip-api.com fetch failed, trying next provider:", err.message);
      }
    }

    // Attempt 3: Fetch from freeipapi.com (reliable fallback)
    if (!data) {
      try {
        const res = await fetchWithTimeout(`https://freeipapi.com/api/json/${targetIp}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.ipAddress) {
            data = json;
            source = "freeipapi.com";
          }
        }
      } catch (err) {
        console.warn("freeipapi.com fetch failed:", err.message);
      }
    }

    // 4. Map API results to unified schema
    if (!data) {
      return NextResponse.json(
        { error: "Could not retrieve geolocation data for this IP address. Please try again later." },
        { status: 502 }
      );
    }

    let parsedResult = {};

    if (source === "ipapi.co") {
      parsedResult = {
        ip: data.ip,
        version: data.version || (data.ip.includes(":") ? "IPv6" : "IPv4"),
        city: data.city || "Unknown",
        region: data.region || "Unknown",
        regionCode: data.region_code || "",
        country: data.country_name || "Unknown",
        countryCode: data.country_code || "",
        continent: getContinentName(data.continent_code),
        postal: data.postal || "Unknown",
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        timezone: data.timezone || "Unknown",
        timezoneOffset: data.utc_offset || "N/A",
        isp: data.org || data.asn || "Unknown",
        org: data.org || "Unknown",
        asn: data.asn || "Unknown",
        currency: data.currency_name || data.currency || "Unknown",
        currencyCode: data.currency || "",
        callingCode: data.country_calling_code || "",
        languages: data.languages || "",
        isProxy: false,
        isHosting: false,
        isMobile: false,
      };
    } else if (source === "ip-api.com") {
      parsedResult = {
        ip: data.query,
        version: data.query.includes(":") ? "IPv6" : "IPv4",
        city: data.city || "Unknown",
        region: data.regionName || "Unknown",
        regionCode: data.region || "",
        country: data.country || "Unknown",
        countryCode: data.countryCode || "",
        continent: data.continent || "Unknown",
        postal: data.zip || "Unknown",
        latitude: parseFloat(data.lat) || 0,
        longitude: parseFloat(data.lon) || 0,
        timezone: data.timezone || "Unknown",
        timezoneOffset: data.offset !== undefined ? formatUtcOffset(data.offset) : "N/A",
        isp: data.isp || "Unknown",
        org: data.org || "Unknown",
        asn: data.as || "Unknown",
        currency: data.currency || "Unknown",
        currencyCode: data.currency || "",
        callingCode: "",
        languages: "",
        isProxy: data.proxy || false,
        isHosting: data.hosting || false,
        isMobile: data.mobile || false,
      };
    } else if (source === "freeipapi.com") {
      parsedResult = {
        ip: data.ipAddress,
        version: data.ipVersion === 6 ? "IPv6" : "IPv4",
        city: data.cityName || "Unknown",
        region: data.regionName || "Unknown",
        regionCode: "",
        country: data.countryName || "Unknown",
        countryCode: data.countryCode || "",
        continent: data.continent || "Unknown",
        postal: data.zipCode || "Unknown",
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        timezone: data.timeZone || "Unknown",
        timezoneOffset: "N/A",
        isp: "Unknown",
        org: "Unknown",
        asn: "Unknown",
        currency: "Unknown",
        currencyCode: "",
        callingCode: "",
        languages: "",
        isProxy: data.isProxy || false,
        isHosting: false,
        isMobile: false,
      };
    }

    return NextResponse.json({
      ...parsedResult,
      isLocalhost,
      resolvedFrom,
      source,
    });

  } catch (error) {
    console.error("IP check endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing the request." },
      { status: 500 }
    );
  }
}
