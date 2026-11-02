/**
 * URL encoding / decoding engine for ToolsTrek.
 * Pure functions only, so the same logic can be unit-tested or reused.
 */

export const SAMPLE_URLS = [
  {
    label: "Search URL",
    value: "https://example.com/search?q=hello world&tag=café ☕&ref=ToolsTrek#results",
  },
  {
    label: "UTM campaign",
    value:
      "https://shop.example.com/summer-sale?utm_source=newsletter&utm_medium=email&utm_campaign=summer%202026",
  },
  {
    label: "Unicode path",
    value: "https://example.com/বাংলা/路径/docs?q=こんにちは&emoji=🚀",
  },
  {
    label: "Form body",
    value: "name=John Doe&email=john+doe@example.com&note=50%25 off!&redirect=/account?a=1",
  },
];

export const MODE_OPTIONS = [
  { value: "component", label: "Component" },
  { value: "uri", label: "Full URL" },
  { value: "form", label: "Form data" },
  { value: "custom", label: "Custom" },
];

export const MODE_HELP = {
  component:
    "encodeURIComponent semantics. Safest for a single query value, path segment or form field.",
  uri:
    "encodeURI semantics. Keeps :/?#[]@!$&'()*+,;= intact so a complete URL stays valid.",
  form:
    "application/x-www-form-urlencoded. Spaces become + and every value is component-encoded.",
  custom:
    "Encode everything except the characters you list as safe. Useful for signing, slugs and vendor APIs.",
};

const RFC3986_EXTRA = /[!'()*]/g;
const RESERVED_DECODE = new Set([";", "/", "?", ":", "@", "&", "=", "+", "$", ",", "#"]);

function isHexPair(value) {
  return /^[0-9a-fA-F]{2}$/.test(value);
}

function percentEscapeCodePoint(char) {
  const encoded = encodeURIComponent(char);
  return encoded.replace(RFC3986_EXTRA, (match) => {
    return `%${match.charCodeAt(0).toString(16).toUpperCase()}`;
  });
}

/**
 * Encode a string according to the selected mode.
 */
export function encodeValue(text, options = {}) {
  const {
    mode = "component",
    spaceAsPlus = false,
    strict = false,
    lowerHex = false,
    safeChars = "",
  } = options;

  if (!text) return "";

  let output;

  if (mode === "custom") {
    const safe = new Set(
      Array.from(`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~${safeChars}`),
    );
    output = Array.from(text)
      .map((char) => {
        if (safe.has(char)) return char;
        try {
          return percentEscapeCodePoint(char);
        } catch {
          return char;
        }
      })
      .join("");
  } else if (mode === "form") {
    output = encodeURIComponent(text);
    if (strict) {
      output = output.replace(RFC3986_EXTRA, (match) => `%${match.charCodeAt(0).toString(16).toUpperCase()}`);
    }
  } else if (mode === "uri") {
    output = encodeURI(text);
    if (strict) {
      output = output.replace(RFC3986_EXTRA, (match) => `%${match.charCodeAt(0).toString(16).toUpperCase()}`);
    }
  } else {
    output = encodeURIComponent(text);
    if (strict) {
      output = output.replace(RFC3986_EXTRA, (match) => `%${match.charCodeAt(0).toString(16).toUpperCase()}`);
    }
  }

  if (spaceAsPlus && mode !== "form") {
    output = output.replace(/%20/g, "+");
  }

  if (lowerHex) {
    output = output.replace(/%[0-9A-F]{2}/g, (match) => match.toLowerCase());
  }

  return output;
}

/**
 * Decode percent escapes, preserving malformed sequences instead of throwing.
 */
export function smartDecode(input, { preserveReserved = false } = {}) {
  let output = "";
  let invalid = 0;
  let index = 0;
  const decoder = new TextDecoder("utf-8", { fatal: true });

  while (index < input.length) {
    if (
      input[index] === "%" &&
      index + 2 < input.length + 1 &&
      isHexPair(input.slice(index + 1, index + 3))
    ) {
      const bytes = [];
      let cursor = index;
      while (
        cursor + 2 < input.length + 1 &&
        input[cursor] === "%" &&
        isHexPair(input.slice(cursor + 1, cursor + 3))
      ) {
        bytes.push(parseInt(input.slice(cursor + 1, cursor + 3), 16));
        cursor += 3;
      }

      if (preserveReserved && bytes.length === 1 && RESERVED_DECODE.has(String.fromCharCode(bytes[0]))) {
        output += input.slice(index, cursor);
      } else {
        try {
          output += decoder.decode(new Uint8Array(bytes));
        } catch {
          output += bytes.map((byte) => String.fromCharCode(byte)).join("");
        }
      }

      index = cursor;
      continue;
    }

    if (input[index] === "%") invalid += 1;
    output += input[index];
    index += 1;
  }

  return { output, invalid };
}

/**
 * Decode a value. Returns the decoded text plus a count of malformed escapes.
 */
export function decodeValue(text, options = {}) {
  const { mode = "component", preserveReserved = false } = options;
  if (!text) return { output: "", invalid: 0 };

  const source = mode === "form" ? text.replace(/\+/g, " ") : text;
  return smartDecode(source, { preserveReserved: preserveReserved || mode === "uri" });
}

export function textStats(text) {
  const chars = Array.from(text).length;
  return {
    chars,
    bytes: new TextEncoder().encode(text).length,
    escapes: (text.match(/%[0-9A-Fa-f]{2}/g) || []).length,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
  };
}

export function processText(text, direction, options) {
  if (!text) {
    return { output: "", invalid: 0, error: "" };
  }

  const { perLine = false } = options;

  if (!perLine) {
    try {
      if (direction === "encode") {
        return { output: encodeValue(text, options), invalid: 0, error: "" };
      }
      const result = decodeValue(text, options);
      return { ...result, error: "" };
    } catch (error) {
      return { output: "", invalid: 0, error: error?.message || "This value could not be processed." };
    }
  }

  const lines = text.split(/\r\n|\r|\n/);
  let invalid = 0;
  const output = lines.map((line) => {
    if (!line) return line;
    if (direction === "encode") return encodeValue(line, options);
    const decoded = decodeValue(line, options);
    invalid += decoded.invalid;
    return decoded.output;
  });

  return { output: output.join("\n"), invalid, error: "" };
}

/**
 * Best-effort URL inspection. Returns null when the input is not URL-shaped.
 */
export function inspectUrl(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  const looksAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  const looksHost = /^[^\s/?#]+\.[^\s/?#]{2,}/i.test(trimmed);

  if (!looksAbsolute && !looksHost) return null;

  let url;
  let inferredScheme = false;

  try {
    url = new URL(trimmed);
  } catch {
    try {
      url = new URL(`https://${trimmed}`);
      inferredScheme = true;
    } catch {
      return null;
    }
  }

  const params = [];
  url.searchParams.forEach((value, key) => {
    params.push({ key, value });
  });

  return {
    url: url.href,
    inferredScheme,
    protocol: url.protocol.replace(/:$/, ""),
    username: url.username,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
    params,
    isSecure: url.protocol === "https:",
  };
}

/**
 * Build a query string from key/value rows.
 */
export function buildQueryString(rows, options = {}) {
  const { sortKeys = false, includeEmpty = true, encode = true } = options;
  const usable = rows
    .filter((row) => row.enabled !== false && String(row.key).trim() !== "")
    .map((row) => {
      const key = encode ? encodeValue(String(row.key).trim(), options) : String(row.key).trim();
      const value = encode ? encodeValue(String(row.value), options) : String(row.value);
      if (!includeEmpty && value === "") return null;
      return { key, value };
    })
    .filter(Boolean);

  if (sortKeys) usable.sort((a, b) => a.key.localeCompare(b.key));
  if (!usable.length) return "";
  return `?${usable.map(({ key, value }) => `${key}=${value}`).join("&")}`;
}

export function parseQueryString(raw) {
  const cleaned = String(raw || "").trim().replace(/^[?&]+/, "");
  if (!cleaned) return [];
  try {
    return Array.from(new URLSearchParams(cleaned).entries()).map(([key, value]) => ({ key, value }));
  } catch {
    return [];
  }
}

export const REFERENCE_ROWS = [
  { char: "(space)", encoded: "%20", meaning: "Space — never legal raw inside a URL", kind: "encode" },
  { char: "!", encoded: "%21", meaning: "Sub-delimiter; encoded in strict RFC 3986 mode", kind: "escape" },
  { char: '"', encoded: "%22", meaning: "Must always be encoded", kind: "escape" },
  { char: "#", encoded: "%23", meaning: "Starts the fragment — encode inside values", kind: "reserved" },
  { char: "$", encoded: "%24", meaning: "Reserved sub-delimiter", kind: "reserved" },
  { char: "%", encoded: "%25", meaning: "Escape introducer — must be encoded as data", kind: "reserved" },
  { char: "&", encoded: "%26", meaning: "Separates query parameters", kind: "reserved" },
  { char: "+", encoded: "%2B", meaning: "Means space in form data — encode a literal plus", kind: "reserved" },
  { char: ",", encoded: "%2C", meaning: "Reserved sub-delimiter", kind: "reserved" },
  { char: "/", encoded: "%2F", meaning: "Path separator", kind: "reserved" },
  { char: ":", encoded: "%3A", meaning: "Scheme and host separator", kind: "reserved" },
  { char: ";", encoded: "%3B", meaning: "Reserved sub-delimiter", kind: "reserved" },
  { char: "<", encoded: "%3C", meaning: "Unsafe character, always encode", kind: "escape" },
  { char: "=", encoded: "%3D", meaning: "Separates keys from values", kind: "reserved" },
  { char: ">", encoded: "%3E", meaning: "Unsafe character, always encode", kind: "escape" },
  { char: "?", encoded: "%3F", meaning: "Starts the query string", kind: "reserved" },
  { char: "@", encoded: "%40", meaning: "Separates credentials from host", kind: "reserved" },
  { char: "[", encoded: "%5B", meaning: "IPv6 host delimiter", kind: "reserved" },
  { char: "]", encoded: "%5D", meaning: "IPv6 host delimiter", kind: "reserved" },
  { char: "\\", encoded: "%5C", meaning: "Unsafe in URLs, always encode", kind: "escape" },
  { char: "^", encoded: "%5E", meaning: "Unsafe character, always encode", kind: "escape" },
  { char: "`", encoded: "%60", meaning: "Unsafe character, always encode", kind: "escape" },
  { char: "{", encoded: "%7B", meaning: "Unsafe character, always encode", kind: "escape" },
  { char: "|", encoded: "%7C", meaning: "Unsafe character, always encode", kind: "escape" },
  { char: "}", encoded: "%7D", meaning: "Unsafe character, always encode", kind: "escape" },
];

export const URL_FAQS = [
  {
    question: "What is the difference between encodeURIComponent and encodeURI?",
    answer:
      "encodeURIComponent escapes every character that is not unreserved, including reserved characters such as / ? & = and #. Use it for a single value. encodeURI leaves reserved characters untouched so a complete URL keeps its structure. In ToolsTrek, choose Component or Full URL to switch between the two behaviours.",
  },
  {
    question: "Why does a space sometimes become + and sometimes %20?",
    answer:
      "In application/x-www-form-urlencoded data — classic HTML form submissions — spaces are represented by + and a literal plus is written as %2B. Inside a normal URL path or query value, a space is %20. The Form data mode performs the + substitution; the other modes keep %20.",
  },
  {
    question: "Is this URL encoder safe for sensitive data?",
    answer:
      "Yes. Encoding and decoding run entirely in your browser with JavaScript, so URLs, tokens and form values never leave your device. There is no upload, logging or server round-trip on this page.",
  },
  {
    question: "What happens to malformed percent escapes such as 100%?",
    answer:
      "A normal decodeURIComponent call throws a URIError and stops processing the whole string. ToolsTrek uses a tolerant decoder that preserves invalid sequences exactly as typed, counts them, and decodes every valid %XX sequence around them — so 100% off stays readable instead of breaking the page.",
  },
  {
    question: "Can I encode or decode a list of values line by line?",
    answer:
      "Yes. Enable Process each line in the encoding options. Each line is encoded or decoded independently and the original line breaks are preserved, which is ideal for keyword lists, tracking parameters and bulk redirect maps.",
  },
  {
    question: "Does the Query Builder handle Unicode and empty values?",
    answer:
      "Yes. Query Builder encodes keys and values with the same engine, supports Unicode and emoji, keeps empty values as key=, optionally sorts keys alphabetically and can import an existing query string into editable rows.",
  },
  {
    question: "How do I encode a URL for a social share or email link?",
    answer:
      "Use Full URL mode for the destination, then Component mode on that encoded URL only if it is being placed inside another parameter — for example share?url=https%3A%2F%2Fexample.com. The Inspector panel shows the decoded parts so you can confirm the result.",
  },
];
