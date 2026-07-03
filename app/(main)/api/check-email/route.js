import { NextResponse } from "next/server";
import dns from "dns";
import fs from "fs";
import path from "path";

// Lazily load the disposable domains list in memory as a Set for O(1) lookups
let disposableSet = null;

function loadDisposableDomains() {
  if (disposableSet) return disposableSet;
  try {
    const filePath = path.join(process.cwd(), "lib", "disposableDomains.json");
    if (fs.existsSync(filePath)) {
      const domainsArray = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      disposableSet = new Set(domainsArray.map(d => d.toLowerCase().trim()));
      console.log(`Loaded ${disposableSet.size} disposable domains into memory.`);
    } else {
      console.warn("disposableDomains.json not found! Fallback to empty list.");
      disposableSet = new Set();
    }
  } catch (error) {
    console.error("Failed to load disposable domains:", error);
    disposableSet = new Set();
  }
  return disposableSet;
}

// Common email providers for typo detection
const COMMON_PROVIDERS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "zoho.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "yandex.com",
  "gmx.com"
];

// Levenshtein Distance for typo detection
function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function detectTypo(domain) {
  const cleanDomain = domain.toLowerCase().trim();
  if (COMMON_PROVIDERS.includes(cleanDomain)) return null;

  for (const provider of COMMON_PROVIDERS) {
    const dist = getLevenshteinDistance(cleanDomain, provider);
    // Suggest if typo distance is very close (1 or 2 edits)
    if (dist > 0 && dist <= 2) {
      // Prevent suggesting long-shots like zoho.com for gmail.com
      if (Math.abs(cleanDomain.length - provider.length) <= 2) {
        return provider;
      }
    }
  }
  return null;
}

// Common role-based account prefixes
const ROLE_PREFIXES = new Set([
  "admin", "administrator", "info", "support", "contact", "sales", "billing", 
  "jobs", "careers", "marketing", "hello", "webmaster", "postmaster", "hostmaster",
  "feedback", "team", "help", "office", "press", "media", "security", "privacy", 
  "hr", "finance", "legal", "no-reply", "noreply", "newsletter", "staff"
]);

// MX keyword list representing disposable infrastructure
const DISPOSABLE_MX_KEYWORDS = [
  "mailinator", "yopmail", "nada", "10minutemail", "tempmail", "temp-mail",
  "guerrillamail", "dispostable", "sharklasers", "mintemail", "throwaway",
  "mailnesia", "mailcatch", "fakeinbox", "tempail", "inboxkitten", "getairmail",
  "maildrop", "crazymailing", "safetymail", "byom", "disposable", "trashmail"
];

// Async helper to resolve MX records with a timeout
function resolveMxWithTimeout(domain, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ error: "TIMEOUT", records: [] });
    }, timeoutMs);

    dns.resolveMx(domain, (err, addresses) => {
      clearTimeout(timer);
      if (err || !addresses || addresses.length === 0) {
        resolve({ error: err ? err.code : "NO_RECORDS", records: [] });
      } else {
        // Sort by priority (lowest first)
        const sorted = addresses.sort((a, b) => a.priority - b.priority);
        resolve({ records: sorted });
      }
    });
  });
}

// Main logic to validate a single email address
async function validateEmail(email, skipMxCheck = false) {
  const result = {
    email: email,
    username: "",
    domain: "",
    isValidSyntax: false,
    isDisposable: false,
    isRoleBased: false,
    isFreeProvider: false,
    typoSuggestion: null,
    mxRecords: [],
    mxCheckStatus: "not_checked",
    score: 100,
    verdict: "Safe",
    details: []
  };

  if (!email || typeof email !== "string") {
    result.score = 0;
    result.verdict = "Risky";
    result.details.push("Invalid input data type");
    return result;
  }

  const trimmedEmail = email.trim();
  
  // 1. Syntax check
  // Standard RFC 5322 compatible regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  result.isValidSyntax = emailRegex.test(trimmedEmail) && trimmedEmail.length <= 254;

  if (!result.isValidSyntax) {
    result.score = 0;
    result.verdict = "Risky";
    result.details.push("Invalid email format syntax");
    return result;
  }

  result.details.push("Email format syntax is valid");

  const atIndex = trimmedEmail.lastIndexOf("@");
  result.username = trimmedEmail.slice(0, atIndex).toLowerCase();
  result.domain = trimmedEmail.slice(atIndex + 1).toLowerCase();

  // 2. Database Disposable check
  const domainsSet = loadDisposableDomains();
  if (domainsSet.has(result.domain)) {
    result.isDisposable = true;
    result.score -= 40;
    result.details.push("Domain matches blacklisted disposable email provider");
  }

  // 3. Typo detection
  const suggestion = detectTypo(result.domain);
  if (suggestion) {
    result.typoSuggestion = suggestion;
    result.score -= 10;
    result.details.push(`Possible typo detected. Did you mean ${suggestion}?`);
  }

  // 4. Role-based check
  if (ROLE_PREFIXES.has(result.username)) {
    result.isRoleBased = true;
    result.score -= 10;
    result.details.push("Role-based/functional address (e.g. support, admin)");
  }

  // 5. Free provider check
  if (COMMON_PROVIDERS.includes(result.domain)) {
    result.isFreeProvider = true;
    result.details.push("Domain is a common personal/free email provider");
  } else if (!result.isDisposable) {
    result.details.push("Domain is recognized as custom/corporate");
  }

  // 6. Live DNS MX lookup
  if (skipMxCheck) {
    result.mxCheckStatus = "skipped";
    result.details.push("DNS MX records check was skipped (bulk processing)");
  } else {
    result.mxCheckStatus = "checking";
    const dnsResult = await resolveMxWithTimeout(result.domain);
    
    if (dnsResult.error) {
      result.mxCheckStatus = "failed";
      // If domain doesn't exist or has no mail routing, deduct heavily
      if (dnsResult.error === "TIMEOUT") {
        result.score -= 65; // Dropping to 35 (Risky)
        result.details.push("DNS resolution timed out; mail server unreachable");
      } else {
        result.score -= 80; // Dropping to 20 (Risky)
        result.details.push(`No active mail exchanger (MX) records found. Email is undeliverable.`);
      }
    } else {
      result.mxCheckStatus = "resolved";
      result.mxRecords = dnsResult.records;
      result.details.push(`Active mail server resolved (${dnsResult.records.length} MX record(s))`);

      // Dynamic MX hostname validation
      let mxDisposableDetected = false;
      for (const record of dnsResult.records) {
        const exchange = record.exchange.toLowerCase();
        const containsKeyword = DISPOSABLE_MX_KEYWORDS.some(keyword => exchange.includes(keyword));
        if (containsKeyword) {
          mxDisposableDetected = true;
          break;
        }
      }

      if (mxDisposableDetected && !result.isDisposable) {
        result.isDisposable = true;
        result.score -= 40;
        result.details.push("Mail exchanger routes through known temporary email servers");
      }
    }
  }

  // Final score clamping and verdict
  result.score = Math.max(0, Math.min(100, result.score));
  
  if (result.isDisposable || result.score < 40) {
    result.verdict = "Risky";
  } else if (result.score < 80) {
    result.verdict = "Warning";
  } else {
    result.verdict = "Safe";
  }

  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, emails, domain } = body;

    // Mode A: Sandbox Domain check
    if (domain) {
      const cleanDomain = domain.toLowerCase().trim();
      const domainsSet = loadDisposableDomains();
      const inDatabase = domainsSet.has(cleanDomain);
      
      const dnsResult = await resolveMxWithTimeout(cleanDomain);
      let mxDisposable = false;
      let mxStatus = "no_records";
      let mxRecords = [];

      if (!dnsResult.error) {
        mxStatus = "resolved";
        mxRecords = dnsResult.records;
        for (const record of dnsResult.records) {
          const exchange = record.exchange.toLowerCase();
          if (DISPOSABLE_MX_KEYWORDS.some(k => exchange.includes(k))) {
            mxDisposable = true;
          }
        }
      } else {
        mxStatus = dnsResult.error === "TIMEOUT" ? "timeout" : "error";
      }

      const isDisposable = inDatabase || mxDisposable;
      const isFree = COMMON_PROVIDERS.includes(cleanDomain);

      let reputationScore = 100;
      if (isDisposable) reputationScore -= 60;
      if (mxStatus !== "resolved") reputationScore -= 80;
      reputationScore = Math.max(0, reputationScore);

      let verdict = "Safe";
      if (isDisposable || reputationScore < 40) verdict = "Risky";
      else if (reputationScore < 80) verdict = "Warning";

      return NextResponse.json({
        domain: cleanDomain,
        isDisposable,
        isFree,
        mxStatus,
        mxRecords,
        reputationScore,
        verdict,
        inDatabase
      });
    }

    // Mode B: Bulk checks
    if (Array.isArray(emails)) {
      // Cap bulk check count for safety
      const cappedEmails = emails.slice(0, 100);
      const isLargeBatch = cappedEmails.length > 10;
      
      const results = [];
      for (const item of cappedEmails) {
        // Skip live MX checks for large batches to avoid performance issues/timeouts
        const skipMx = isLargeBatch;
        const res = await validateEmail(item, skipMx);
        results.push(res);
      }

      return NextResponse.json({
        total: cappedEmails.length,
        results,
        truncated: emails.length > 100
      });
    }

    // Mode C: Single check (default)
    if (email) {
      const result = await validateEmail(email, false);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Please provide an email, a list of emails, or a domain to check" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in check-email API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during email validation" },
      { status: 500 }
    );
  }
}
