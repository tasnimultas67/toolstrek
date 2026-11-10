/* -------------------------------------------------------------------------- */
/*  Suspicious URL Analyzer — detection rules, scoring and reference data     */
/*  Everything runs locally in the browser. No URL ever leaves this page.     */
/* -------------------------------------------------------------------------- */

export const URL_FAQS = [
  {
    question: "Is this URL checker accurate enough to trust?",
    answer:
      "It is a heuristic risk assessment, not a guarantee. The analyzer looks for structural patterns that commonly appear in phishing, malware delivery and scam links. A low score does not prove a site is safe, and a high score does not prove it is malicious. Always verify the domain independently before entering credentials or payment details.",
  },
  {
    question: "Does this tool visit or open the URL?",
    answer:
      "No. The URL is parsed as text with the browser's URL parser and scored with local rules. No request is made to the destination, so the site cannot see you, set cookies or log your IP address from this analysis.",
  },
  {
    question: "What does the risk score mean?",
    answer:
      "The score is a weighted sum of the red flags that were triggered, scaled by your sensitivity setting and capped at 100. Critical findings such as a javascript: scheme or a domain on your blocklist jump straight to the top of the scale. You can disable individual detectors or tune the score in the Rules tab.",
  },
  {
    question: "Why do look-alike and punycode domains matter?",
    answer:
      "Attackers register domains that visually resemble a trusted brand, for example using a digit 1 instead of a lowercase L, or Cyrillic letters that look identical to Latin ones. Browsers may display the internationalized form, so the address bar can appear convincing. The analyzer compares the host against a list of commonly impersonated brands and flags mixed-script hosts.",
  },
  {
    question: "Can I check a list of URLs at once?",
    answer:
      "Yes. Open the Bulk scan tab, paste one URL per line and the analyzer will score every entry. You can filter the results by risk level and export the report as CSV or JSON.",
  },
  {
    question: "What should I do if a URL is flagged?",
    answer:
      "Do not open it from the message. Navigate to the official service by typing its known address, or use a bookmark you already trust. Report the message to your email provider, and if you already entered credentials, change that password and enable multi-factor authentication immediately.",
  },
  {
    question: "Are shortened links always unsafe?",
    answer:
      "No, but they hide the destination. A shortener makes it impossible to judge the final domain from the text alone, so the analyzer adds risk. If you must open one, expand it with a reputable link expander first or open it in an isolated browser profile.",
  },
  {
    question: "Does a suspicious TLD automatically mean a scam?",
    answer:
      "No. Some cheap or free top-level domains have a higher abuse rate, but plenty of legitimate sites use them. The TLD is one weak signal among many. A .com domain can be just as malicious, which is why the score combines several independent checks.",
  },
];

export const URL_SAMPLES = [
  {
    label: "Normal product page",
    value: "https://www.example.com/products/spring-collection?page=2&sort=price",
  },
  {
    label: "Shortened link",
    value: "https://bit.ly/3xYzAbC",
  },
  {
    label: "Raw IP with a login path",
    value: "http://192.168.10.24:8080/login/verify-account",
  },
  {
    label: "Look-alike brand domain",
    value:
      "https://paypa1-secure-login.verify-account.xyz/signin?redirect=https://evil.example/collect",
  },
  {
    label: "Punycode host",
    value: "https://xn--pypal-4ve.com/account/update",
  },
  {
    label: "Dangerous scheme",
    value: "javascript:alert(document.cookie)",
  },
];

export const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "bitly.com",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "shorturl.at",
  "rebrand.ly",
  "tiny.cc",
  "rb.gy",
  "s.id",
  "bl.ink",
  "lnkd.in",
  "t.ly",
  "v.gd",
  "short.io",
  "shorte.st",
  "adf.ly",
  "bc.vc",
  "clck.ru",
  "u.to",
  "x.co",
  "me2.do",
  "qr.ae",
  "tr.im",
  "urlz.fr",
  "surl.li",
  "1url.com",
  "hyper.co",
  "linkshortener.com",
]);

export const SUSPICIOUS_TLDS = new Set([
  "zip",
  "mov",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "xyz",
  "top",
  "click",
  "link",
  "work",
  "support",
  "review",
  "country",
  "stream",
  "download",
  "racing",
  "win",
  "bid",
  "loan",
  "men",
  "date",
  "faith",
  "science",
  "party",
  "trade",
  "webcam",
  "cricket",
  "account",
  "icu",
  "cam",
  "rest",
  "buzz",
  "monster",
  "quest",
  "cyou",
  "sbs",
  "fun",
  "lol",
  "bond",
  "beauty",
  "hair",
  "skin",
  "makeup",
  "mom",
  "boats",
  "autos",
  "homes",
  "vip",
  "wang",
  "ren",
]);

export const COMMON_TLDS = new Set([
  "com",
  "org",
  "net",
  "edu",
  "gov",
  "mil",
  "int",
  "io",
  "co",
  "ai",
  "app",
  "dev",
  "info",
  "biz",
  "me",
  "tv",
  "cc",
  "us",
  "uk",
  "ca",
  "au",
  "nz",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "se",
  "no",
  "dk",
  "fi",
  "ch",
  "at",
  "be",
  "ie",
  "pt",
  "pl",
  "cz",
  "gr",
  "tr",
  "ru",
  "ua",
  "in",
  "bd",
  "pk",
  "lk",
  "jp",
  "kr",
  "cn",
  "hk",
  "tw",
  "sg",
  "my",
  "id",
  "ph",
  "th",
  "vn",
  "ae",
  "sa",
  "qa",
  "il",
  "za",
  "ng",
  "ke",
  "eg",
  "ma",
  "br",
  "mx",
  "ar",
  "cl",
  "pe",
  "eu",
]);

export const SECOND_LEVEL_SUFFIXES = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "co.jp",
  "or.jp",
  "ne.jp",
  "ac.jp",
  "go.jp",
  "com.au",
  "net.au",
  "org.au",
  "edu.au",
  "gov.au",
  "co.nz",
  "net.nz",
  "org.nz",
  "co.in",
  "net.in",
  "org.in",
  "co.za",
  "org.za",
  "com.br",
  "com.mx",
  "com.ar",
  "com.sg",
  "com.my",
  "com.tr",
  "com.cn",
  "com.hk",
  "com.tw",
  "co.kr",
  "or.kr",
  "co.id",
  "co.th",
  "com.ph",
  "com.vn",
  "com.bd",
  "com.pk",
  "co.il",
  "com.sa",
  "com.ae",
  "com.qa",
]);

export const DANGEROUS_EXTENSIONS = new Set([
  "exe",
  "scr",
  "com",
  "pif",
  "bat",
  "cmd",
  "msi",
  "msp",
  "cpl",
  "hta",
  "vbs",
  "vbe",
  "js",
  "jse",
  "wsf",
  "wsh",
  "ps1",
  "psm1",
  "jar",
  "apk",
  "dmg",
  "pkg",
  "deb",
  "rpm",
  "docm",
  "xlsm",
  "pptm",
  "dotm",
  "xlam",
  "iso",
  "img",
  "vhd",
  "lnk",
  "reg",
  "svg",
]);

export const RISKY_PARAMS = new Set([
  "url",
  "uri",
  "u",
  "redirect",
  "redirect_uri",
  "redirect_url",
  "return",
  "returnurl",
  "return_url",
  "next",
  "continue",
  "dest",
  "destination",
  "target",
  "redir",
  "forward",
  "link",
  "out",
  "goto",
  "callback",
  "callback_url",
  "auth",
  "login",
  "signin",
  "checkout",
  "file",
  "download",
  "src",
  "source",
  "ref",
  "referrer",
]);

export const SENSITIVE_PATH_TERMS = [
  "login",
  "signin",
  "sign-in",
  "verify",
  "verification",
  "secure",
  "account",
  "update",
  "confirm",
  "unlock",
  "billing",
  "invoice",
  "payment",
  "wallet",
  "password",
  "reset",
  "recover",
  "authorize",
  "session",
];

const OFFICIAL_BRANDS = [
  { brand: "paypal", domains: ["paypal.com", "paypal.me"] },
  { brand: "apple", domains: ["apple.com", "icloud.com"] },
  { brand: "microsoft", domains: ["microsoft.com", "live.com", "office.com", "outlook.com"] },
  { brand: "google", domains: ["google.com", "gmail.com", "youtube.com"] },
  { brand: "amazon", domains: ["amazon.com", "amazon.co.uk", "amazon.de"] },
  { brand: "netflix", domains: ["netflix.com"] },
  { brand: "facebook", domains: ["facebook.com", "fb.com"] },
  { brand: "instagram", domains: ["instagram.com"] },
  { brand: "whatsapp", domains: ["whatsapp.com"] },
  { brand: "linkedin", domains: ["linkedin.com"] },
  { brand: "twitter", domains: ["twitter.com", "x.com"] },
  { brand: "binance", domains: ["binance.com"] },
  { brand: "coinbase", domains: ["coinbase.com"] },
  { brand: "metamask", domains: ["metamask.io"] },
  { brand: "dhl", domains: ["dhl.com"] },
  { brand: "fedex", domains: ["fedex.com"] },
  { brand: "ups", domains: ["ups.com"] },
  { brand: "usps", domains: ["usps.com"] },
  { brand: "steam", domains: ["steampowered.com", "steamcommunity.com"] },
  { brand: "roblox", domains: ["roblox.com"] },
  { brand: "discord", domains: ["discord.com", "discord.gg"] },
  { brand: "spotify", domains: ["spotify.com"] },
  { brand: "dropbox", domains: ["dropbox.com"] },
  { brand: "adobe", domains: ["adobe.com"] },
  { brand: "chase", domains: ["chase.com"] },
  { brand: "wellsfargo", domains: ["wellsfargo.com"] },
  { brand: "bankofamerica", domains: ["bankofamerica.com"] },
  { brand: "hsbc", domains: ["hsbc.com"] },
  { brand: "barclays", domains: ["barclays.co.uk"] },
];

export const DEFAULT_ENABLED = {
  "dangerous-scheme": true,
  "data-uri": true,
  "credentials": true,
  "at-symbol": true,
  "ip-host": true,
  "numeric-host": true,
  "punycode": true,
  "mixed-scripts": true,
  "shortener": true,
  "suspicious-tld": true,
  "uncommon-tld": true,
  "non-standard-port": true,
  "insecure-http": true,
  "long-url": true,
  "long-host": true,
  "many-subdomains": true,
  "hyphenated-host": true,
  "digit-host": true,
  "brand-impersonation": true,
  "custom-keyword": true,
  "risky-param": true,
  "dangerous-extension": true,
  "double-extension": true,
  "encoded-chars": true,
  "many-dots": true,
  "sensitive-path": true,
  "control-chars": true,
  "blocklist": true,
};

export const DETECTORS = [
  {
    id: "dangerous-scheme",
    group: "Protocol",
    label: "Dangerous or non-web scheme",
    description: "javascript:, data:, vbscript:, file: and similar schemes can execute code or read local files.",
    weight: 60,
    severity: "critical",
  },
  {
    id: "data-uri",
    group: "Protocol",
    label: "Inline data: payload",
    description: "A data: URL embeds its own content and is frequently used to deliver fake login pages.",
    weight: 45,
    severity: "high",
  },
  {
    id: "credentials",
    group: "Protocol",
    label: "Username or password in the URL",
    description: "user:password@host syntax hides the real destination and leaks credentials in logs.",
    weight: 40,
    severity: "high",
  },
  {
    id: "at-symbol",
    group: "Protocol",
    label: "@ in the authority",
    description: "An @ before the real host makes the visible part of the link misleading.",
    weight: 35,
    severity: "high",
  },
  {
    id: "ip-host",
    group: "Host",
    label: "Raw IP address instead of a domain",
    description: "Legitimate consumer services almost always use a domain name, not a bare IP address.",
    weight: 30,
    severity: "high",
  },
  {
    id: "numeric-host",
    group: "Host",
    label: "Numeric or hexadecimal host",
    description: "Decimal, octal or hex encoded IP addresses can bypass simple domain filters.",
    weight: 25,
    severity: "medium",
  },
  {
    id: "punycode",
    group: "Host",
    label: "Punycode / internationalised host",
    description: "xn-- labels can render as letters that look identical to a trusted brand.",
    weight: 35,
    severity: "high",
  },
  {
    id: "mixed-scripts",
    group: "Host",
    label: "Mixed writing systems in the host",
    description: "Mixing Latin with Cyrillic, Greek or other scripts is a classic homograph attack.",
    weight: 40,
    severity: "high",
  },
  {
    id: "shortener",
    group: "Host",
    label: "Known link shortener",
    description: "The final destination is hidden behind a redirect service.",
    weight: 20,
    severity: "medium",
  },
  {
    id: "suspicious-tld",
    group: "Domain",
    label: "High-abuse top-level domain",
    description: "This TLD appears disproportionately often in spam and phishing campaigns.",
    weight: 25,
    severity: "high",
  },
  {
    id: "uncommon-tld",
    group: "Domain",
    label: "Uncommon top-level domain",
    description: "The TLD is not in the common set, which is a weak signal worth reviewing.",
    weight: 8,
    severity: "low",
  },
  {
    id: "non-standard-port",
    group: "Host",
    label: "Non-standard network port",
    description: "Web traffic normally uses 443 or 80. An explicit unusual port can indicate a staging or phishing server.",
    weight: 15,
    severity: "medium",
  },
  {
    id: "insecure-http",
    group: "Protocol",
    label: "Unencrypted HTTP",
    description: "Anything typed or submitted travels without TLS protection.",
    weight: 12,
    severity: "low",
  },
  {
    id: "long-url",
    group: "Path & Query",
    label: "Unusually long URL",
    description: "Very long URLs are used to push the real domain out of view or hide embedded parameters.",
    weight: 12,
    severity: "medium",
  },
  {
    id: "long-host",
    group: "Host",
    label: "Very long hostname",
    description: "Long hostnames are often generated to look official or to defeat pattern matching.",
    weight: 12,
    severity: "medium",
  },
  {
    id: "many-subdomains",
    group: "Host",
    label: "Excessive subdomains",
    description: "Deep subdomain chains let attackers place a brand name early in the address.",
    weight: 20,
    severity: "medium",
  },
  {
    id: "hyphenated-host",
    group: "Host",
    label: "Hyphen-heavy hostname",
    description: "Domains such as secure-login-verify-account are typical of credential phishing.",
    weight: 12,
    severity: "low",
  },
  {
    id: "digit-host",
    group: "Host",
    label: "Digits inside the hostname",
    description: "Replacing letters with digits is a common look-alike trick.",
    weight: 8,
    severity: "low",
  },
  {
    id: "brand-impersonation",
    group: "Domain",
    label: "Brand name on a non-official domain",
    description: "A well-known brand appears in the host, but the registrable domain is not one of its official domains.",
    weight: 35,
    severity: "high",
  },
  {
    id: "custom-keyword",
    group: "Domain",
    label: "Custom watch-list keyword",
    description: "The URL contains a keyword from your own watch list.",
    weight: 25,
    severity: "medium",
  },
  {
    id: "risky-param",
    group: "Path & Query",
    label: "Open-redirect style parameter",
    description: "A redirect, next, return or url parameter points to another external destination.",
    weight: 30,
    severity: "high",
  },
  {
    id: "dangerous-extension",
    group: "Path & Query",
    label: "Executable or macro file path",
    description: "The path ends in a file type that can run code or execute macros.",
    weight: 40,
    severity: "high",
  },
  {
    id: "double-extension",
    group: "Path & Query",
    label: "Double file extension",
    description: "A harmless-looking extension followed by an executable one is a classic disguise.",
    weight: 30,
    severity: "high",
  },
  {
    id: "encoded-chars",
    group: "Encoding",
    label: "Heavy or double character encoding",
    description: "Many percent escapes, especially double-encoded ones, can hide the real path or payload.",
    weight: 18,
    severity: "medium",
  },
  {
    id: "many-dots",
    group: "Host",
    label: "Many dots in the host",
    description: "A long dotted chain makes the true registrable domain harder to spot.",
    weight: 12,
    severity: "low",
  },
  {
    id: "sensitive-path",
    group: "Path & Query",
    label: "Credential-related path words",
    description: "Words such as login, verify or account appear in the path. Common on real sites, but also on phishing pages.",
    weight: 10,
    severity: "low",
  },
  {
    id: "control-chars",
    group: "Encoding",
    label: "Control or zero-width characters",
    description: "Invisible characters can break filters or visually reorder parts of the address.",
    weight: 20,
    severity: "medium",
  },
  {
    id: "blocklist",
    group: "Reputation",
    label: "Domain is on your blocklist",
    description: "The host matches an entry you explicitly blocked in the Rules tab.",
    weight: 100,
    severity: "critical",
  },
];

export const DETECTOR_GROUPS = ["Protocol", "Host", "Domain", "Path & Query", "Encoding", "Reputation"];

export const STRICTNESS_OPTIONS = [
  { value: "lenient", label: "Lenient" },
  { value: "balanced", label: "Balanced" },
  { value: "strict", label: "Strict" },
];

export const DEFAULT_OPTIONS = {
  strictness: "balanced",
  sensitivity: 5,
  enabled: { ...DEFAULT_ENABLED },
  customTlds: "",
  customKeywords: "",
  blocklist: "",
  allowlist: "",
};

const LEVEL_STYLES = {
  safe: {
    label: "Likely safe",
    description: "No meaningful structural red flags were found.",
    tone: "emerald",
    color: "#10b981",
  },
  low: {
    label: "Low risk",
    description: "A few weak signals appeared. Verify the domain before sharing anything sensitive.",
    tone: "sky",
    color: "#0ea5e9",
  },
  moderate: {
    label: "Moderate risk",
    description: "Several patterns commonly used by suspicious links are present. Proceed with care.",
    tone: "amber",
    color: "#f59e0b",
  },
  high: {
    label: "High risk",
    description: "Strong phishing or malware indicators were found. Avoid opening this link.",
    tone: "rose",
    color: "#f43f5e",
  },
  critical: {
    label: "Critical risk",
    description: "This link should be treated as dangerous. Do not open it or enter any information.",
    tone: "rose",
    color: "#e11d48",
  },
};

export function levelMeta(level) {
  return LEVEL_STYLES[level] || LEVEL_STYLES.low;
}

export function severityTone(severity) {
  if (severity === "critical") return "rose";
  if (severity === "high") return "rose";
  if (severity === "medium") return "amber";
  return "sky";
}

const RISK_THRESHOLDS = {
  lenient: [25, 45, 70, 90],
  balanced: [15, 35, 60, 80],
  strict: [8, 22, 45, 65],
};

export function riskLevel(score, strictness = "balanced") {
  const [safe, low, moderate, high] = RISK_THRESHOLDS[strictness] || RISK_THRESHOLDS.balanced;
  if (score < safe) return "safe";
  if (score < low) return "low";
  if (score < moderate) return "moderate";
  if (score < high) return "high";
  return "critical";
}

export function splitList(value) {
  return String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function decodeSafely(value, times = 2) {
  let output = value;
  for (let index = 0; index < times; index += 1) {
    try {
      const decoded = decodeURIComponent(output);
      if (decoded === output) break;
      output = decoded;
    } catch {
      break;
    }
  }
  return output;
}

function isIPv4(host) {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function isIPv6(host) {
  return host.includes(":") || host.startsWith("[");
}

function isNumericHost(host) {
  if (!host) return false;
  if (/^\d+$/.test(host)) return true;
  if (/^0x[0-9a-f]+$/i.test(host)) return true;
  if (/^0[0-7]+$/.test(host)) return true;
  return false;
}

function registrableDomain(hostname) {
  if (!hostname || isIPv4(hostname) || isIPv6(hostname)) return hostname;
  const labels = hostname.split(".").filter(Boolean);
  if (labels.length <= 2) return hostname;
  const lastTwo = labels.slice(-2).join(".");
  if (SECOND_LEVEL_SUFFIXES.has(lastTwo)) {
    return labels.slice(-3).join(".");
  }
  return lastTwo;
}

function isOfficialBrandDomain(hostname, domains) {
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function hostMatchesList(hostname, entries) {
  if (!hostname) return null;
  for (const entry of entries) {
    const clean = entry.replace(/^\*\.?/, "").replace(/^https?:\/\//, "").split("/")[0];
    if (!clean) continue;
    if (hostname === clean || hostname.endsWith(`.${clean}`)) return clean;
  }
  return null;
}

function extractRawHost(text) {
  let value = String(text || "").trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").replace(/^\/\//, "");
  const authority = value.split(/[/?#]/)[0] || "";
  const withoutCredentials = authority.split("@").pop() || "";
  if (withoutCredentials.startsWith("[")) {
    return withoutCredentials.slice(0, withoutCredentials.indexOf("]") + 1);
  }
  return withoutCredentials.split(":")[0];
}

function detectMixedScripts(host) {
  if (!host) return { mixed: false, scripts: [] };
  const scripts = [];
  const tests = [
    { name: "Latin", re: /\p{Script=Latin}/u },
    { name: "Cyrillic", re: /\p{Script=Cyrillic}/u },
    { name: "Greek", re: /\p{Script=Greek}/u },
    { name: "Arabic", re: /\p{Script=Arabic}/u },
    { name: "Hebrew", re: /\p{Script=Hebrew}/u },
    { name: "Han", re: /\p{Script=Han}/u },
    { name: "Hiragana", re: /\p{Script=Hiragana}/u },
    { name: "Katakana", re: /\p{Script=Katakana}/u },
    { name: "Hangul", re: /\p{Script=Hangul}/u },
    { name: "Devanagari", re: /\p{Script=Devanagari}/u },
    { name: "Thai", re: /\p{Script=Thai}/u },
  ];
  for (const test of tests) {
    if (test.re.test(host)) scripts.push(test.name);
  }
  return { mixed: scripts.length > 1, scripts };
}

export function analyzeUrl(rawInput, options = {}) {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    enabled: { ...DEFAULT_ENABLED, ...(options.enabled || {}) },
  };
  const raw = String(rawInput || "");
  const trimmed = raw.trim();
  const cleaned = trimmed.replace(/[\u200B-\u200D\uFEFF]/g, "");

  if (!trimmed) {
    return { ok: false, empty: true, error: "Paste a URL above to run the analysis." };
  }

  if (/\s/.test(cleaned)) {
    return {
      ok: false,
      error:
        "The URL contains a space. Remove the space or replace it with %20 — otherwise the destination is ambiguous.",
      raw: trimmed,
    };
  }

  let candidate = cleaned;
  let inferredScheme = false;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    candidate = cleaned.startsWith("//") ? `https:${cleaned}` : `https://${cleaned}`;
    inferredScheme = true;
  }

  let url;
  try {
    url = new URL(candidate);
  } catch {
    return {
      ok: false,
      error:
        "This does not parse as a valid URL. Check for missing dots, unmatched brackets or stray characters.",
      raw: trimmed,
    };
  }

  const protocol = url.protocol.toLowerCase();
  const hostname = (url.hostname || "").toLowerCase().replace(/\.$/, "");
  const rawHost = extractRawHost(cleaned).toLowerCase();
  const href = url.href;
  const decoded = decodeSafely(href, 2);
  const labels = hostname && !isIPv4(hostname) && !isIPv6(hostname) ? hostname.split(".").filter(Boolean) : [];
  const tld = labels.length > 1 ? labels[labels.length - 1] : "";
  const allowEntries = splitList(opts.allowlist);
  const blockEntries = splitList(opts.blocklist);
  const customTlds = splitList(opts.customTlds);
  const customKeywords = splitList(opts.customKeywords);
  const allowMatch = hostMatchesList(hostname, allowEntries);
  const blockMatch = hostMatchesList(hostname, blockEntries);

  const checks = [];
  const addCheck = (id, triggered, detail, extra = {}) => {
    const meta = DETECTORS.find((item) => item.id === id);
    if (!meta) return;
    checks.push({
      ...meta,
      triggered: Boolean(triggered),
      enabled: opts.enabled[id] !== false,
      detail: detail || meta.description,
      weight: extra.weight ?? meta.weight,
      severity: extra.severity ?? meta.severity,
    });
  };

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(cleaned);
  const dangerousScheme = hasScheme && !["http:", "https:", "mailto:", "tel:"].includes(protocol);
  const hasAtInAuthority = /@/.test(cleaned.split(/[/?#]/)[0] || "") && !protocol.startsWith("mailto:");
  const encodedCount = (cleaned.match(/%[0-9a-f]{2}/gi) || []).length;
  const doubleEncoded = /%25[0-9a-f]{2}/i.test(cleaned);
  const pathLower = (url.pathname || "").toLowerCase();
  const searchLower = (url.search || "").toLowerCase();
  const finalSegment = pathLower.split("/").filter(Boolean).pop() || "";
  const extensionMatch = finalSegment.match(/\.([a-z0-9]{1,8})$/);
  const extension = extensionMatch ? extensionMatch[1] : "";
  const doubleExtMatch = finalSegment.match(/\.([a-z0-9]{2,5})\.([a-z0-9]{2,5})$/);
  const doubleExt = doubleExtMatch && DANGEROUS_EXTENSIONS.has(doubleExtMatch[2]);
  const hyphenCount = (hostname.match(/-/g) || []).length;
  const digitCount = (hostname.match(/\d/g) || []).length;
  const dotCount = (hostname.match(/\./g) || []).length;
  const mixed = detectMixedScripts(rawHost || hostname);
  const hostHasUnicode = /[^\u0000-\u007F]/.test(rawHost);
  const riskyParams = [];
  try {
    for (const [key, value] of url.searchParams.entries()) {
      if (RISKY_PARAMS.has(key.toLowerCase()) && /^(https?:)?\/\/|^[a-z0-9-]+\.[a-z]{2,}/i.test(value.trim())) {
        riskyParams.push({ key, value });
      }
    }
  } catch {
    // Malformed query — the URL parser already accepted the rest.
  }
  const brandHits = OFFICIAL_BRANDS.filter(
    ({ brand, domains }) => hostname.includes(brand) && !isOfficialBrandDomain(hostname, domains),
  );
  const sensitiveWords = SENSITIVE_PATH_TERMS.filter((term) => pathLower.includes(term));
  const customHits = customKeywords.filter((keyword) =>
    `${hostname}${pathLower}${searchLower}`.includes(keyword),
  );

  addCheck(
    "dangerous-scheme",
    dangerousScheme,
    dangerousScheme
      ? `The link uses the "${protocol}" scheme instead of http or https. Schemes like javascript: and data: can run code in the page that opens them.`
      : "The link uses a normal web or contact scheme.",
  );

  addCheck(
    "data-uri",
    protocol === "data:",
    protocol === "data:"
      ? "The entire page is embedded inside the URL as a data: payload. This is a common way to host a fake login form without a real domain."
      : "No inline data: payload was detected.",
  );

  addCheck(
    "credentials",
    Boolean(url.username || url.password),
    Boolean(url.username || url.password)
      ? "Credentials appear before the host (user:password@host). The part users read as the domain is not necessarily the real destination."
      : "No username or password is embedded in the URL.",
  );

  addCheck(
    "at-symbol",
    hasAtInAuthority && !url.username && !url.password,
    hasAtInAuthority
      ? "An @ character appears in the authority section. Everything before it can be crafted to look like a familiar address."
      : "No misleading @ sign in the authority section.",
  );

  addCheck(
    "ip-host",
    isIPv4(hostname) || isIPv6(hostname),
    isIPv4(hostname) || isIPv6(hostname)
      ? "The host is a raw IP address. Phishing kits are often hosted on temporary servers with no domain name."
      : "The host is a domain name rather than a raw IP address.",
  );

  addCheck(
    "numeric-host",
    isNumericHost(hostname),
    isNumericHost(hostname)
      ? "The host is expressed as a single number or hexadecimal value, which resolves to an IP address but hides it from casual inspection."
      : "The host is not an encoded numeric address.",
  );

  addCheck(
    "punycode",
    labels.some((label) => label.startsWith("xn--")),
    labels.some((label) => label.startsWith("xn--"))
      ? "The host contains a punycode label. It may render as a different-looking name in your browser, often imitating a trusted brand."
      : "No punycode labels were found in the host.",
  );

  addCheck(
    "mixed-scripts",
    mixed.mixed || (hostHasUnicode && !labels.some((label) => label.startsWith("xn--"))),
    mixed.mixed
      ? `The host mixes ${mixed.scripts.join(", ")} characters. Homograph attacks use look-alike letters from different alphabets.`
      : hostHasUnicode
        ? "The host contains non-ASCII characters. Confirm the spelling carefully before trusting it."
        : "The host uses a single writing system.",
  );

  addCheck(
    "shortener",
    Boolean(hostname) && [...SHORTENER_HOSTS].some((short) => hostname === short || hostname.endsWith(`.${short}`)),
    [...SHORTENER_HOSTS].some((short) => hostname === short || hostname.endsWith(`.${short}`))
      ? "This is a known URL shortener, so the real destination is hidden until the redirect resolves."
      : "The host is not a known link shortener.",
  );

  addCheck(
    "suspicious-tld",
    Boolean(tld) && (SUSPICIOUS_TLDS.has(tld) || customTlds.includes(tld)),
    Boolean(tld) && (SUSPICIOUS_TLDS.has(tld) || customTlds.includes(tld))
      ? `The .${tld} top-level domain has a comparatively high abuse rate. This is a weak signal, not proof.`
      : tld
        ? `The .${tld} top-level domain is not on the high-abuse list.`
        : "No top-level domain could be determined.",
  );

  addCheck(
    "uncommon-tld",
    Boolean(tld) && !COMMON_TLDS.has(tld) && !SUSPICIOUS_TLDS.has(tld),
    Boolean(tld) && !COMMON_TLDS.has(tld) && !SUSPICIOUS_TLDS.has(tld)
      ? `The .${tld} top-level domain is uncommon. Verify that the organisation actually uses it.`
      : "The top-level domain is a widely used one.",
  );

  addCheck(
    "non-standard-port",
    Boolean(url.port) && !["80", "443"].includes(url.port),
    Boolean(url.port) && !["80", "443"].includes(url.port)
      ? `The URL explicitly connects on port ${url.port}. Public websites normally use 443 (HTTPS) or 80 (HTTP).`
      : "The URL uses the default web port.",
  );

  addCheck(
    "insecure-http",
    protocol === "http:",
    protocol === "http:"
      ? "The connection is unencrypted. Passwords, cookies and form data can be read or modified in transit."
      : "The connection uses HTTPS or does not require transport security.",
  );

  addCheck(
    "long-url",
    cleaned.length > 120,
    cleaned.length > 120
      ? `The URL is ${cleaned.length} characters long. Long links are used to bury the real domain or hide redirect parameters.`
      : "The URL length is within a normal range.",
    { severity: cleaned.length > 220 ? "high" : "medium", weight: cleaned.length > 220 ? 22 : 12 },
  );

  addCheck(
    "long-host",
    hostname.length > 30,
    hostname.length > 30
      ? `The hostname is ${hostname.length} characters long, which makes it hard to verify quickly.`
      : "The hostname length is reasonable.",
  );

  addCheck(
    "many-subdomains",
    labels.length > 3,
    labels.length > 3
      ? `The host has ${labels.length} labels (${labels.join(".")}). Brand names are often placed in subdomains of an unrelated domain.`
      : "The host uses a normal number of subdomain labels.",
    { severity: labels.length > 5 ? "high" : "medium", weight: labels.length > 5 ? 30 : 20 },
  );

  addCheck(
    "hyphenated-host",
    hyphenCount >= 3,
    hyphenCount >= 3
      ? `The hostname contains ${hyphenCount} hyphens. Strings such as secure-login-account are typical of credential phishing.`
      : "The hostname is not unusually hyphenated.",
  );

  addCheck(
    "digit-host",
    digitCount > 0 && !isIPv4(hostname),
    digitCount > 0 && !isIPv4(hostname)
      ? `The hostname contains ${digitCount} digit${digitCount === 1 ? "" : "s"}. Replacing letters with digits is a common look-alike trick.`
      : "The hostname contains no digits.",
    { weight: digitCount >= 3 ? 12 : 8 },
  );

  addCheck(
    "brand-impersonation",
    brandHits.length > 0,
    brandHits.length > 0
      ? `The host mentions ${brandHits.map((hit) => hit.brand).join(", ")} but is not on that brand's official domain list. This is a strong impersonation signal.`
      : "No known brand names appear on an unrelated domain.",
  );

  addCheck(
    "custom-keyword",
    customHits.length > 0,
    customHits.length > 0
      ? `Your watch list matched: ${customHits.join(", ")}.`
      : customKeywords.length
        ? "None of your watch-list keywords appear in the URL."
        : "No custom watch-list keywords are configured.",
  );

  addCheck(
    "risky-param",
    riskyParams.length > 0,
    riskyParams.length > 0
      ? `The query string sends a redirect-style value: ${riskyParams
          .map((item) => `${item.key}=${item.value}`)
          .join(", ")}. Attackers use these parameters to bounce victims to another site.`
      : "No open-redirect style query parameter was found.",
  );

  addCheck(
    "dangerous-extension",
    DANGEROUS_EXTENSIONS.has(extension),
    DANGEROUS_EXTENSIONS.has(extension)
      ? `The path ends in .${extension}, a file type that can execute code or run macros. Never open it from an unsolicited link.`
      : "The path does not end in a known executable or macro file type.",
  );

  addCheck(
    "double-extension",
    Boolean(doubleExt),
    doubleExt
      ? `The filename ends in .${doubleExtMatch[1]}.${doubleExtMatch[2]}. The first extension is used to make the file look harmless.`
      : "No double file extension was detected.",
  );

  addCheck(
    "encoded-chars",
    encodedCount >= 4 || doubleEncoded,
    encodedCount >= 4 || doubleEncoded
      ? `The URL contains ${encodedCount} percent-encoded byte${encodedCount === 1 ? "" : "s"}${
          doubleEncoded ? " including double encoding" : ""
        }. This can hide the real path or payload.`
      : "Character encoding is not unusually heavy.",
    {
      severity: encodedCount >= 12 || doubleEncoded ? "high" : "medium",
      weight: encodedCount >= 12 ? 28 : 18,
    },
  );

  addCheck(
    "many-dots",
    dotCount >= 4,
    dotCount >= 4
      ? `The hostname contains ${dotCount} dots. Long dotted chains make the registrable domain hard to identify.`
      : "The number of dots in the hostname is normal.",
  );

  addCheck(
    "sensitive-path",
    sensitiveWords.length > 0 && !allowMatch,
    sensitiveWords.length > 0 && !allowMatch
      ? `The path contains credential-related words (${sensitiveWords.join(", ")}). Real sites do this too, so treat it as a weak signal only.`
      : "No credential-related path words were found.",
  );

  addCheck(
    "control-chars",
    /[\u0000-\u001F\u007F]/.test(cleaned),
    /[\u0000-\u001F\u007F]/.test(cleaned)
      ? "The URL contains control characters. These are not valid in normal links and can be used to evade filters."
      : "No control characters were found.",
  );

  addCheck(
    "blocklist",
    Boolean(blockMatch),
    blockMatch
      ? `The host matches your blocklist entry "${blockMatch}".`
      : blockEntries.length
        ? "The host is not on your blocklist."
        : "No custom blocklist entries are configured.",
  );

  const activeFindings = checks.filter((check) => check.enabled && check.triggered);
  const disabledFindings = checks.filter((check) => !check.enabled && check.triggered);
  const baseScore = activeFindings.reduce((total, finding) => total + finding.weight, 0);
  const sensitivityFactor = 0.6 + (Number(opts.sensitivity || 5) / 10) * 0.8;
  let score = Math.round(Math.min(100, baseScore * sensitivityFactor));

  if (blockMatch && opts.enabled["blocklist"] !== false) score = 100;
  if (allowMatch) score = Math.min(score, 8);

  const level = riskLevel(score, opts.strictness);
  const enabledChecks = checks.filter((check) => check.enabled);
  const passedChecks = enabledChecks.filter((check) => !check.triggered);

  return {
    ok: true,
    raw: trimmed,
    href,
    decoded,
    normalized: url.toString(),
    inferredScheme,
    protocol: protocol.replace(":", ""),
    hostname,
    rawHost,
    registrableDomain: registrableDomain(hostname),
    tld,
    labels,
    port: url.port || "",
    pathname: url.pathname || "/",
    search: url.search || "",
    hash: url.hash || "",
    isHttps: protocol === "https:",
    username: url.username || "",
    score,
    baseScore: Math.round(baseScore),
    level,
    allowlisted: Boolean(allowMatch),
    blocklisted: Boolean(blockMatch),
    findings: activeFindings.sort((a, b) => b.weight - a.weight),
    disabledFindings,
    passedChecks,
    checks,
    counts: {
      critical: activeFindings.filter((item) => item.severity === "critical").length,
      high: activeFindings.filter((item) => item.severity === "high").length,
      medium: activeFindings.filter((item) => item.severity === "medium").length,
      low: activeFindings.filter((item) => item.severity === "low").length,
      passed: passedChecks.length,
    },
    encoding: {
      percentEscapes: encodedCount,
      doubleEncoded,
      mixedScripts: mixed.mixed,
      scripts: mixed.scripts,
      unicodeHost: hostHasUnicode,
    },
    riskyParams,
  };
}

export function buildReportText(result) {
  if (!result?.ok) return "";
  const lines = [
    "ToolsTrek — Suspicious URL Analyzer report",
    `URL: ${result.href}`,
    `Host: ${result.hostname}`,
    `Risk score: ${result.score}/100 (${levelMeta(result.level).label})`,
    `Strictness: ${result.strictness || "balanced"}`,
    "",
    `Findings (${result.findings.length}):`,
  ];
  if (result.findings.length === 0) {
    lines.push("  No active red flags were detected.");
  } else {
    result.findings.forEach((finding, index) => {
      lines.push(
        `  ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.label} (+${finding.weight})`,
      );
      lines.push(`     ${finding.detail}`);
    });
  }
  if (result.passedChecks.length) {
    lines.push("", `Checks passed (${result.passedChecks.length}): ${result.passedChecks.map((c) => c.label).join(", ")}`);
  }
  lines.push("", "This is a heuristic assessment, not a guarantee of safety.");
  return lines.join("\n");
}

export function buildBulkCsv(rows) {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = ["URL", "Host", "Score", "Risk level", "Top finding", "Findings", "Status"];
  const body = rows.map((row) => [
    row.url,
    row.host || "",
    row.score,
    row.ok ? levelMeta(row.level).label : "Invalid URL",
    row.ok ? row.findings[0]?.label || "None" : row.error,
    row.ok ? row.findings.length : "",
    row.ok ? "Analyzed" : "Error",
  ]);
  return [header, ...body].map((line) => line.map(escape).join(",")).join("\r\n");
}
