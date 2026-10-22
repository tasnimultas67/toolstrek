export const ID_MODES = [
  {
    id: "uuidv4",
    label: "UUID v4",
    short: "v4",
    family: "UUID",
    accent: "Random",
    tagline: "Pure random",
    description: "122 random bits with no timestamp. The safest default when you just need an opaque, unique identifier.",
    entropy: 122,
    timeOrdered: false,
  },
  {
    id: "uuidv7",
    label: "UUID v7",
    short: "v7",
    family: "UUID",
    accent: "Time-ordered",
    tagline: "Sortable + random",
    description: "A Unix-millisecond prefix plus 74 random bits. Sorts by creation time and indexes well in databases.",
    entropy: 74,
    timeOrdered: true,
  },
  {
    id: "uuidv1",
    label: "UUID v1",
    short: "v1",
    family: "UUID",
    accent: "Legacy time",
    tagline: "Legacy time-based",
    description: "A 100-nanosecond timestamp with a random node and clock sequence. Compatible with systems that require v1.",
    entropy: 62,
    timeOrdered: true,
  },
  {
    id: "uuidv5",
    label: "UUID v5",
    short: "v5",
    family: "UUID",
    accent: "Deterministic",
    tagline: "Name-based",
    description: "A SHA-1 hash of a namespace and name. The same inputs always produce the same UUID.",
    entropy: 0,
    timeOrdered: false,
  },
  {
    id: "ulid",
    label: "ULID",
    short: "ULID",
    family: "ULID",
    accent: "Sortable",
    tagline: "Time + random",
    description: "A 26-character Crockford Base32 identifier with a millisecond timestamp and 80 random bits.",
    entropy: 80,
    timeOrdered: true,
  },
  {
    id: "nanoid",
    label: "NanoID",
    short: "Nano",
    family: "NanoID",
    accent: "Compact",
    tagline: "URL-friendly",
    description: "A configurable random string. Choose a length and alphabet for URLs, filenames or short public IDs.",
    entropy: 126,
    timeOrdered: false,
  },
];

export const UUID_NAMESPACES = [
  {
    id: "dns",
    label: "DNS",
    uuid: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    hint: "Domain names, e.g. example.com",
  },
  {
    id: "url",
    label: "URL",
    uuid: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    hint: "URLs, e.g. https://example.com/page",
  },
  {
    id: "oid",
    label: "OID",
    uuid: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    hint: "ISO object identifiers",
  },
  {
    id: "x500",
    label: "X.500 DN",
    uuid: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
    hint: "Distinguished names",
  },
  {
    id: "custom",
    label: "Custom UUID",
    uuid: "",
    hint: "Use another UUID as the namespace",
  },
];

export const NANOID_DEFAULT_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

export const DEFAULT_OPTIONS = {
  mode: "uuidv4",
  quantity: 5,
  uppercase: false,
  hyphens: true,
  braces: false,
  separator: "newline",
  monotonic: true,
  nanoLength: 21,
  nanoAlphabet: NANOID_DEFAULT_ALPHABET,
  namespace: "dns",
  customNamespace: "",
  name: "example.com",
};

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CROCKFORD_INDEX = Object.fromEntries(
  Array.from(CROCKFORD).map((character, index) => [character, index]),
);
const MAX_QUANTITY = 1000;
const MIN_QUANTITY = 1;
const UUID_TICKS_OFFSET = 122192928000000000n;
const MAX_UUID_V7_RANDOM = (1n << 74n) - 1n;
const MAX_ULID_RANDOM = (1n << 80n) - 1n;

function randomBytes(length) {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure random generation is not available in this browser.");
  }
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function randomBigInt(bits) {
  const bytes = randomBytes(Math.ceil(bits / 8));
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  return value & ((1n << BigInt(bits)) - 1n);
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const clean = hex.replace(/-/g, "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(clean.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

export function formatUuidHex(hexValue) {
  const clean = hexValue.replace(/-/g, "").toLowerCase();
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function uuidFromBytes(bytes) {
  return formatUuidHex(bytesToHex(bytes));
}

export function generateUuidV4() {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return uuidFromBytes(bytes);
}

export function generateUuidV7Batch(count, timestamp = Date.now()) {
  const values = [];
  const baseRandom = randomBigInt(74);
  const millis = BigInt(timestamp) & ((1n << 48n) - 1n);

  for (let index = 0; index < count; index += 1) {
    const random = (baseRandom + BigInt(index)) & MAX_UUID_V7_RANDOM;
    const randA = (random >> 62n) & 0xfffn;
    const randB = random & ((1n << 62n) - 1n);
    const full = (millis << 80n) | (0x7n << 76n) | (randA << 64n) | (0b10n << 62n) | randB;
    values.push(formatUuidHex(full.toString(16).padStart(32, "0")));
  }

  return values;
}

export function generateUuidV1Batch(count, timestamp = Date.now()) {
  const values = [];
  const baseTicks = BigInt(timestamp) * 10000n + UUID_TICKS_OFFSET;
  const clockSequence = randomBigInt(14);
  let node = randomBigInt(48);
  node |= 1n << 40n; // Multicast bit: this is a random node, not a MAC address.

  for (let index = 0; index < count; index += 1) {
    const ticks = baseTicks + BigInt(index);
    const timeLow = ticks & 0xffffffffn;
    const timeMid = (ticks >> 32n) & 0xffffn;
    const timeHigh = (ticks >> 48n) & 0x0fffn;
    const hex = [
      timeLow.toString(16).padStart(8, "0"),
      timeMid.toString(16).padStart(4, "0"),
      `1${timeHigh.toString(16).padStart(3, "0")}`,
      (0x8000n | clockSequence).toString(16).padStart(4, "0"),
      node.toString(16).padStart(12, "0"),
    ].join("");
    values.push(formatUuidHex(hex));
  }

  return values;
}

export async function generateUuidV5({ namespace, customNamespace, name }) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "UUID v5 needs the Web Crypto API. Use HTTPS or localhost, or choose another mode.",
    );
  }
  if (!name || name.length === 0) {
    throw new Error("Enter a name to hash into the UUID.");
  }
  if (name.length > 2048) {
    throw new Error("Keep the name under 2,048 characters.");
  }

  const namespaceUuid =
    namespace === "custom"
      ? customNamespace.trim()
      : UUID_NAMESPACES.find((item) => item.id === namespace)?.uuid;

  if (!isUuid(namespaceUuid)) {
    throw new Error("Enter a valid custom namespace UUID.");
  }

  const namespaceBytes = hexToBytes(namespaceUuid);
  const nameBytes = new TextEncoder().encode(name);
  const combined = new Uint8Array(namespaceBytes.length + nameBytes.length);
  combined.set(namespaceBytes, 0);
  combined.set(nameBytes, namespaceBytes.length);
  const digest = await globalThis.crypto.subtle.digest("SHA-1", combined);
  const bytes = new Uint8Array(digest).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return uuidFromBytes(bytes);
}

export function encodeUlidTime(timestamp) {
  let value = BigInt(timestamp);
  let output = "";
  for (let index = 0; index < 10; index += 1) {
    output = CROCKFORD[Number(value & 31n)] + output;
    value >>= 5n;
  }
  return output;
}

function encodeUlidRandom(value) {
  let remaining = value;
  let output = "";
  for (let index = 0; index < 16; index += 1) {
    output = CROCKFORD[Number(remaining & 31n)] + output;
    remaining >>= 5n;
  }
  return output;
}

export function generateUlidBatch(count, { monotonic = true, timestamp = Date.now() } = {}) {
  const values = [];
  let millis = BigInt(timestamp);
  let random = randomBigInt(80);

  for (let index = 0; index < count; index += 1) {
    if (index > 0) {
      if (monotonic) {
        random += 1n;
        if (random > MAX_ULID_RANDOM) {
          random = 0n;
          millis += 1n;
        }
      } else {
        random = randomBigInt(80);
      }
    }
    values.push(`${encodeUlidTime(millis)}${encodeUlidRandom(random)}`);
  }

  return values;
}

export function nanoAlphabetCharacters(alphabet) {
  return Array.from(new Set(Array.from(String(alphabet || ""))));
}

export function generateNanoIdBatch(length, alphabet, count) {
  const characters = nanoAlphabetCharacters(alphabet);
  if (characters.length < 2) {
    throw new Error("Use at least two unique characters in the alphabet.");
  }
  if (characters.length > 200) {
    throw new Error("Keep the alphabet to 200 unique characters or fewer.");
  }
  if (length < 1 || length > 256) {
    throw new Error("NanoID length must be between 1 and 256 characters.");
  }

  const limit = Math.floor(256 / characters.length) * characters.length;
  const values = [];

  for (let item = 0; item < count; item += 1) {
    let value = "";
    while (value.length < length) {
      const bytes = randomBytes(Math.max(16, length * 2));
      for (const byte of bytes) {
        if (byte >= limit) continue;
        value += characters[byte % characters.length];
        if (value.length === length) break;
      }
    }
    values.push(value);
  }

  return values;
}

export function isUuid(value) {
  if (typeof value !== "string") return false;
  const clean = value.trim().replace(/^\{|\}$/g, "").replace(/-/g, "");
  return /^[0-9a-fA-F]{32}$/.test(clean);
}

export function isUlid(value) {
  if (typeof value !== "string") return false;
  const clean = value.trim().toUpperCase().replace(/[IL]/g, "1").replace(/O/g, "0");
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(clean);
}

export function decodeUlid(value) {
  if (!isUlid(value)) return null;
  const clean = value.trim().toUpperCase().replace(/[IL]/g, "1").replace(/O/g, "0");
  let timestamp = 0;
  for (const character of clean.slice(0, 10)) {
    timestamp = timestamp * 32 + CROCKFORD_INDEX[character];
  }
  let random = 0n;
  for (const character of clean.slice(10)) {
    random = (random << 5n) | BigInt(CROCKFORD_INDEX[character]);
  }
  return {
    timestamp,
    random,
    canonical: clean,
  };
}

export function inspectIdentifier(value) {
  const input = String(value || "").trim();
  if (!input) {
    return { status: "empty" };
  }

  if (isUlid(input)) {
    const decoded = decodeUlid(input);
    const date = new Date(decoded.timestamp);
    return {
      status: "valid",
      kind: "ULID",
      canonical: decoded.canonical,
      version: null,
      versionLabel: "ULID (Crockford Base32)",
      variant: "80-bit random tail",
      timestamp: date,
      timestampMs: decoded.timestamp,
      randomBits: 80,
      notes: [
        "The first 10 characters encode a 48-bit Unix millisecond timestamp.",
        "The final 16 characters contain 80 bits of random data.",
        "Canonically uppercase; lowercase input is accepted and normalised.",
      ],
    };
  }

  if (isUuid(input)) {
    const clean = input.replace(/^\{|\}$/g, "").replace(/-/g, "").toLowerCase();
    const canonical = formatUuidHex(clean);
    const versionNibble = Number.parseInt(clean[12], 16);
    const variantNibble = Number.parseInt(clean[16], 16);
    const variantValid = (variantNibble & 0b1100) === 0b1000;
    const nil = clean === "0".repeat(32);
    const max = clean === "f".repeat(32);
    let version = versionNibble;
    let versionLabel = `UUID version ${versionNibble}`;
    let timestamp = null;
    let randomBits = null;

    if (nil) {
      versionLabel = "Nil UUID";
      version = 0;
    } else if (max) {
      versionLabel = "Max UUID";
      version = null;
    } else if (versionNibble === 1) {
      versionLabel = "UUID v1 (Gregorian time)";
      const timeLow = BigInt(Number.parseInt(clean.slice(0, 8), 16));
      const timeMid = BigInt(Number.parseInt(clean.slice(8, 12), 16));
      const timeHigh = BigInt(Number.parseInt(clean.slice(13, 16), 16));
      const ticks = (timeHigh << 48n) | (timeMid << 32n) | timeLow;
      const unixMs = Number(ticks / 10000n) - 12219292800000;
      timestamp = new Date(unixMs);
      randomBits = 62;
    } else if (versionNibble === 6) {
      versionLabel = "UUID v6 (reordered time)";
      const timeHigh = BigInt(Number.parseInt(clean.slice(0, 8), 16));
      const timeMid = BigInt(Number.parseInt(clean.slice(8, 12), 16));
      const timeLow = BigInt(Number.parseInt(clean.slice(13, 16), 16));
      const ticks = (timeHigh << 28n) | (timeMid << 12n) | timeLow;
      const unixMs = Number(ticks / 10000n) - 12219292800000;
      timestamp = new Date(unixMs);
      randomBits = 62;
    } else if (versionNibble === 7) {
      versionLabel = "UUID v7 (Unix time-ordered)";
      timestamp = new Date(Number.parseInt(clean.slice(0, 12), 16));
      randomBits = 74;
    } else if (versionNibble === 4) {
      versionLabel = "UUID v4 (random)";
      randomBits = 122;
    } else if (versionNibble === 3) {
      versionLabel = "UUID v3 (MD5 name-based)";
      randomBits = 0;
    } else if (versionNibble === 5) {
      versionLabel = "UUID v5 (SHA-1 name-based)";
      randomBits = 0;
    } else if (versionNibble === 8) {
      versionLabel = "UUID v8 (custom)";
    }

    const validTimestamp = timestamp && Number.isFinite(timestamp.getTime());
    return {
      status: "valid",
      kind: "UUID",
      canonical,
      version,
      versionLabel,
      variant: variantValid ? "RFC 4122 / RFC 9562" : "Non-standard variant bits",
      timestamp: validTimestamp ? timestamp : null,
      timestampMs: validTimestamp ? timestamp.getTime() : null,
      randomBits,
      notes: [
        variantValid
          ? "The variant bits mark this as a standard RFC UUID."
          : "The variant nibble is not in the RFC 4122/9562 range (8–b). Some systems may reject it.",
        versionNibble >= 3 && versionNibble <= 5
          ? "Name-based UUIDs are deterministic: the same namespace and name always produce the same value."
          : "The version nibble identifies how the UUID was constructed.",
        versionNibble === 1
          ? "This generator uses a random node and clock sequence, not a hardware MAC address."
          : "The canonical form is 36 characters with hyphens and lowercase hexadecimal.",
      ],
    };
  }

  return {
    status: "invalid",
    kind: null,
    message:
      "Not a recognised UUID or ULID. Check the character count, hyphens and Base32 letters.",
  };
}

export function formatIdentifier(value, options) {
  if (options.mode.startsWith("uuid")) {
    let result = String(value).toLowerCase();
    if (options.hyphens === false) result = result.replace(/-/g, "");
    if (options.uppercase) result = result.toUpperCase();
    if (options.braces) result = `{${result}}`;
    return result;
  }
  if (options.mode === "ulid") return String(value).toUpperCase();
  return String(value);
}

export function buildOutput(values, options) {
  if (options.separator === "json") {
    return JSON.stringify(values, null, 2);
  }
  if (options.separator === "comma") return values.join(", ");
  if (options.separator === "space") return values.join(" ");
  return values.join("\n");
}

export function getEntropyBits(mode, options) {
  if (mode === "nanoid") {
    const characters = nanoAlphabetCharacters(options.nanoAlphabet);
    return characters.length > 1
      ? Math.round(options.nanoLength * Math.log2(characters.length))
      : 0;
  }
  return ID_MODES.find((item) => item.id === mode)?.entropy || 0;
}

export function collisionLabel(entropyBits, quantity) {
  if (entropyBits <= 0) return "Deterministic";
  if (quantity < 2) return "Single ID";
  const log10 = Math.log10((quantity * (quantity - 1)) / 2) - entropyBits * Math.log10(2);
  if (log10 < -18) return "Negligible";
  const denominator = 10 ** -log10;
  if (denominator >= 1e6) {
    return `About 1 in ${denominator.toExponential(1)}`;
  }
  return `About 1 in ${Math.round(denominator).toLocaleString("en-US")}`;
}

export function formatGeneratedAt(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

export function formatInspectDate(value) {
  if (!value || Number.isNaN(value.getTime())) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(value);
  } catch {
    return null;
  }
}

export async function generateIdentifiers(options) {
  const quantity = options.mode === "uuidv5" ? 1 : Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Number(options.quantity) || 1));
  let values = [];
  let error = "";
  const generatedAt = Date.now();

  try {
    if (options.mode === "uuidv4") {
      values = Array.from({ length: quantity }, () => generateUuidV4());
    } else if (options.mode === "uuidv7") {
      values = generateUuidV7Batch(quantity, generatedAt);
    } else if (options.mode === "uuidv1") {
      values = generateUuidV1Batch(quantity, generatedAt);
    } else if (options.mode === "uuidv5") {
      values = [
        await generateUuidV5({
          namespace: options.namespace,
          customNamespace: options.customNamespace,
          name: options.name,
        }),
      ];
    } else if (options.mode === "ulid") {
      values = generateUlidBatch(quantity, {
        monotonic: options.monotonic,
        timestamp: generatedAt,
      });
    } else if (options.mode === "nanoid") {
      values = generateNanoIdBatch(
        Number(options.nanoLength),
        options.nanoAlphabet,
        quantity,
      );
    } else {
      error = "Choose an identifier format.";
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "The identifiers could not be generated.";
  }

  const mode = ID_MODES.find((item) => item.id === options.mode);
  const entropyBits = getEntropyBits(options.mode, options);

  return {
    values,
    error,
    mode: options.mode,
    modeLabel: mode?.label || "Identifier",
    quantity: values.length,
    entropyBits,
    collision: collisionLabel(entropyBits, values.length),
    generatedAt,
    timeOrdered: Boolean(mode?.timeOrdered),
  };
}

export const ID_FAQS = [
  {
    question: "What is the difference between UUID v4, v7 and ULID?",
    answer:
      "UUID v4 is 122 random bits with no timestamp, so values are opaque and cannot be sorted by creation time. UUID v7 puts a 48-bit Unix millisecond timestamp first and fills the rest with 74 random bits, making it sortable while remaining globally unique. ULID uses the same millisecond prefix but encodes the whole value in 26 Crockford Base32 characters with 80 random bits, so it is shorter to read and naturally case-insensitive.",
  },
  {
    question: "Are these identifiers generated securely?",
    answer:
      "Yes. Random values come from crypto.getRandomValues(), which uses the operating system's cryptographically secure random number generator. There is no Math.random fallback. UUID v5 uses the Web Crypto SHA-1 digest exactly as the RFC specifies; SHA-1 is used here as a deterministic name mapping, not as a password security primitive.",
  },
  {
    question: "Can two generated identifiers collide?",
    answer:
      "The chance is astronomically small for random UUIDs, ULIDs and well-sized NanoIDs. A UUID v4 has 122 random bits, a ULID has 80 random bits per millisecond and a 21-character NanoID over a 64-character alphabet has about 126 bits. The collision estimate in the output panel shows the pairwise probability for the batch you generated.",
  },
  {
    question: "What does monotonic mean for ULID?",
    answer:
      "Standard ULIDs generated in the same millisecond may sort randomly because each one has an independent random tail. With monotonic output enabled, each additional ULID in the same batch increments the previous random tail, so the whole batch sorts in creation order. The timestamp still comes first.",
  },
  {
    question: "When should I use UUID v5?",
    answer:
      "UUID v5 is for deterministic mapping, not for secrets. Given the same namespace and name, it always returns the same UUID. That is useful for stable integration IDs, deduplicating records or mapping a domain name to an identifier. Because the output is predictable, never use UUID v5 where an unguessable token is required.",
  },
  {
    question: "Are time-based identifiers private?",
    answer:
      "UUID v1, UUID v7 and ULID all reveal an approximate creation timestamp. That is often useful for debugging and database ordering, but it can leak when a record was created. UUID v4 and random NanoIDs do not contain a timestamp. This generator never embeds a hardware MAC address: UUID v1 uses a random node identifier with the multicast bit set.",
  },
  {
    question: "Is anything uploaded or stored?",
    answer:
      "No. Generation, formatting, validation and downloads happen entirely in your browser. There is no API call, account or analytics event for the identifiers. Refreshing the page discards the current batch.",
  },
];
