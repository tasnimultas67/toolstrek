import { NextResponse } from "next/server";
import tls from "tls";
import net from "net";
import dns from "dns";

// ─────────────────────────────────────────────
// Helper: fetch cert details from a domain
// ─────────────────────────────────────────────
function fetchSSLCert(hostname, port = 443) {
  return new Promise((resolve, reject) => {
    const timeoutMs = 12000;
    let completed = false;

    const done = (err, data) => {
      if (completed) return;
      completed = true;
      try {
        if (socket) socket.destroy();
      } catch (e) {}
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    };

    let socket;
    try {
      socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname, // SNI support
          rejectUnauthorized: false, // We want to inspect even invalid certs
          timeout: timeoutMs,
        },
        () => {
          try {
            const cert = socket.getPeerCertificate(true); // detailed chain
            const authorized = socket.authorized;
            const authorizationError = socket.authorizationError || null;
            const protocol = socket.getProtocol();
            const cipher = socket.getCipher();
            done(null, { cert, authorized, authorizationError, protocol, cipher });
          } catch (err) {
            done(err);
          }
        }
      );

      socket.setTimeout(timeoutMs, () => {
        done(new Error("Connection timed out"));
      });

      socket.on("error", (err) => {
        done(err);
      });
    } catch (err) {
      done(err);
    }
  });
}

// ─────────────────────────────────────────────
// Parse Subject / Issuer objects into readable strings
// ─────────────────────────────────────────────
function parseCertName(obj) {
  if (!obj || typeof obj !== "object") return "Unknown";
  const parts = [];
  if (obj.CN) parts.push(`CN=${obj.CN}`);
  if (obj.O) parts.push(`O=${obj.O}`);
  if (obj.OU) parts.push(`OU=${obj.OU}`);
  if (obj.C) parts.push(`C=${obj.C}`);
  if (obj.L) parts.push(`L=${obj.L}`);
  if (obj.ST) parts.push(`ST=${obj.ST}`);
  return parts.join(", ") || "Unknown";
}

// ─────────────────────────────────────────────
// Determine cert type (DV / OV / EV) heuristically
// ─────────────────────────────────────────────
function getCertType(cert) {
  const subjectO = cert?.subject?.O;
  const subjectJurisdiction = cert?.subject?.jurisdictionC;

  if (subjectJurisdiction || cert?.subject?.businessCategory?.toLowerCase().includes("ev")) {
    return "EV (Extended Validation)";
  }
  if (subjectO && subjectO.length > 0) {
    return "OV (Organization Validation)";
  }
  return "DV (Domain Validation)";
}

// ─────────────────────────────────────────────
// Parse SANs (Subject Alternative Names)
// ─────────────────────────────────────────────
function parseSANs(cert) {
  const altNames = cert?.subjectaltname;
  if (!altNames) return [];
  return altNames
    .split(",")
    .map((s) => s.replace(/^DNS:/, "").replace(/^IP Address:/, "IP:").trim())
    .filter(Boolean);
}

// ─────────────────────────────────────────────
// Build certificate chain array
// ─────────────────────────────────────────────
function buildChain(cert) {
  const chain = [];
  let current = cert;
  const seen = new Set();

  while (current && !seen.has(current.fingerprint)) {
    if (current.fingerprint) seen.add(current.fingerprint);

    chain.push({
      subject: parseCertName(current.subject),
      issuer: parseCertName(current.issuer),
      cn: current.subject?.CN || "Unknown",
      issuerCn: current.issuer?.CN || "Unknown",
      serialNumber: current.serialNumber || "N/A",
      fingerprint: current.fingerprint || "N/A",
      fingerprint256: current.fingerprint256 || "N/A",
      validFrom: current.valid_from || null,
      validTo: current.valid_to || null,
    });

    if (current.issuerCertificate && current.issuerCertificate !== current) {
      current = current.issuerCertificate;
    } else {
      break;
    }
  }

  return chain;
}

// ─────────────────────────────────────────────
// Resolve hostname to IP
// ─────────────────────────────────────────────
function resolveHostname(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, (err, address) => {
      resolve(err ? null : address);
    });
  });
}

// ─────────────────────────────────────────────
// POST /api/check-ssl
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    let { domain, port = 443 } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain name is required" },
        { status: 400 }
      );
    }

    // Strip protocol if included
    domain = domain.replace(/^https?:\/\//i, "").trim().toLowerCase();

    // Extract port if specified in the domain string (e.g. google.com:443)
    const portMatch = domain.match(/:(\d+)(?:\/|\?|#|$)/);
    if (portMatch) {
      port = Number(portMatch[1]);
    }

    // Remove path/query/fragment/port to get clean domain
    const domainClean = domain.split(/[/?#]/)[0].split(":")[0];

    // Basic domain validation
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    if (!domainRegex.test(domainClean)) {
      return NextResponse.json(
        { error: "Please enter a valid domain (e.g., google.com)" },
        { status: 400 }
      );
    }

    // Resolve IP in parallel
    const [sslResult, resolvedIp] = await Promise.all([
      fetchSSLCert(domainClean, Number(port)),
      resolveHostname(domainClean),
    ]);

    const { cert, authorized, authorizationError, protocol, cipher } = sslResult;

    if (!cert || !cert.subject) {
      return NextResponse.json(
        { error: "No SSL certificate found for this domain." },
        { status: 404 }
      );
    }

    const now = new Date();
    const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
    const validTo = cert.valid_to ? new Date(cert.valid_to) : null;

    const daysRemaining = validTo
      ? Math.ceil((validTo - now) / (1000 * 60 * 60 * 24))
      : null;

    const isExpired = validTo ? now > validTo : false;
    const isNotYetValid = validFrom ? now < validFrom : false;
    const isWildcard = parseSANs(cert).some((s) => s.startsWith("*."));
    const sans = parseSANs(cert);
    const chain = buildChain(cert);

    const certInfo = {
      domain: domainClean,
      port: Number(port),
      resolvedIp,

      // Validity
      isValid: authorized,
      authorizationError: authorizationError || null,
      isExpired,
      isNotYetValid,
      daysRemaining,

      // Dates
      validFrom: validFrom?.toISOString() || null,
      validTo: validTo?.toISOString() || null,

      // Subject
      subject: parseCertName(cert.subject),
      commonName: cert.subject?.CN || "Unknown",
      organization: cert.subject?.O || null,
      organizationalUnit: cert.subject?.OU || null,
      country: cert.subject?.C || null,

      // Issuer
      issuer: parseCertName(cert.issuer),
      issuerCN: cert.issuer?.CN || "Unknown",
      issuerOrg: cert.issuer?.O || null,

      // Certificate details
      certType: getCertType(cert),
      serialNumber: cert.serialNumber || "N/A",
      fingerprint: cert.fingerprint || "N/A",
      fingerprint256: cert.fingerprint256 || "N/A",
      isWildcard,

      // SANs
      sans,
      sanCount: sans.length,

      // Protocol & Cipher (advanced)
      protocol: protocol || "Unknown",
      cipherName: cipher?.name || "Unknown",
      cipherVersion: cipher?.version || "Unknown",
      keyBits: cipher?.secretKeySize ? cipher.secretKeySize * 8 : null,

      // Certificate chain
      chain,
      chainDepth: chain.length,
    };

    return NextResponse.json(certInfo);
  } catch (error) {
    console.error("SSL check error:", error);

    let userMessage = "Failed to retrieve SSL certificate information.";
    if (error.message?.includes("timed out")) {
      userMessage = "Connection timed out. The host may be unreachable or blocked.";
    } else if (error.code === "ENOTFOUND") {
      userMessage = "Domain not found. Please check the domain name.";
    } else if (error.code === "ECONNREFUSED") {
      userMessage = `Connection refused on port 443. The server may not be serving HTTPS.`;
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
