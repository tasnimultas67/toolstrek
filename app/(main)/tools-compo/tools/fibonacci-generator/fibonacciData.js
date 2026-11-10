/* -------------------------------------------------------------------------- */
/*  Fibonacci Generator — exact BigInt sequences, checker and number theory   */
/* -------------------------------------------------------------------------- */

export const FIB_FAQS = [
  {
    question: "What are the first Fibonacci numbers?",
    answer:
      "Starting with F(0) = 0 and F(1) = 1, each term is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144 and so on. Some textbooks start at 1, 1 instead; this generator lets you choose the starting seeds and whether the zero term is shown.",
  },
  {
    question: "How does the generator handle very large terms?",
    answer:
      "It uses JavaScript BigInt and fast doubling, so there is no floating-point rounding or Infinity. The 10,000th Fibonacci number has 2,090 digits and is calculated exactly. The index is capped at 100,000 to keep the page responsive.",
  },
  {
    question: "What is the golden ratio connection?",
    answer:
      "The ratio of consecutive Fibonacci numbers approaches the golden ratio φ ≈ 1.6180339887. Binet's formula gives F(n) = (φⁿ − ψⁿ) / √5, where ψ = (1 − √5) / 2. The approximation becomes accurate extremely quickly, which is why Fibonacci numbers appear in growth patterns and design.",
  },
  {
    question: "Can I generate negative Fibonacci numbers?",
    answer:
      "Yes, with the standard seeds. The negafibonacci extension defines F(−n) = (−1)^(n+1) × F(n). So F(−1) = 1, F(−2) = −1, F(−3) = 2, and the sequence continues symmetrically. Custom seeds do not have this property, so negative indices are restricted to the standard sequence.",
  },
  {
    question: "How can I tell whether a number is a Fibonacci number?",
    answer:
      "A non-negative integer N is Fibonacci exactly when 5N² + 4 or 5N² − 4 is a perfect square. The checker uses that identity with exact BigInt arithmetic, then locates the index with a binary search using fast doubling.",
  },
  {
    question: "What is a Zeckendorf representation?",
    answer:
      "Every positive integer can be written uniquely as a sum of non-consecutive Fibonacci numbers. For example, 100 = 89 + 8 + 3 = F(11) + F(6) + F(4). The checker includes this decomposition for the value you enter and the generator includes it for the last term.",
  },
  {
    question: "Why are some Fibonacci terms marked as primes?",
    answer:
      "A Fibonacci prime is a Fibonacci number that is also prime. The tool checks terms that fit safely within 64-bit arithmetic using deterministic Miller–Rabin. Larger terms are skipped rather than guessed, because proving primality for thousand-digit numbers is a different kind of computation.",
  },
  {
    question: "Can I export the sequence?",
    answer:
      "Yes. You can copy the formatted output, download a text or CSV file, or switch the output format to a table, CSV or JSON preview. Indexing, delimiters, grouping separators, prefixes, suffixes and reversal are all configurable.",
  },
];

export const MAX_INDEX = 100000;
export const MAX_TERMS = 2000;

export const SERIES_MODES = [
  { value: "count", label: "First N terms" },
  { value: "range", label: "Index range" },
  { value: "max", label: "Up to value" },
  { value: "nth", label: "Nth term" },
];

export const OUTPUT_FORMATS = [
  { value: "list", label: "List" },
  { value: "table", label: "Table" },
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
];

export const DELIMITERS = [
  { value: "comma", label: "Comma" },
  { value: "space", label: "Space" },
  { value: "newline", label: "New line" },
  { value: "semicolon", label: "Semicolon" },
  { value: "pipe", label: "Pipe" },
  { value: "custom", label: "Custom" },
];

export const DELIMITER_VALUES = {
  comma: ", ",
  space: " ",
  newline: "\n",
  semicolon: "; ",
  pipe: " | ",
};

const PHI = (1 + Math.sqrt(5)) / 2;

export function fibBigInt(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error("Index must be a non-negative integer.");
  let a = 0n;
  let b = 1n;
  let target = n;
  // Iterative fast doubling: F(2k) and F(2k+1) from F(k), F(k+1).
  const bits = [];
  while (target > 0) {
    bits.push(target & 1);
    target >>= 1;
  }
  for (let index = bits.length - 1; index >= 0; index -= 1) {
    const c = a * (2n * b - a);
    const d = a * a + b * b;
    if (bits[index] === 1) {
      a = d;
      b = c + d;
    } else {
      a = c;
      b = d;
    }
  }
  return a;
}

export function fibPair(n) {
  return [fibBigInt(n), fibBigInt(n + 1)];
}

export function negafibBigInt(n) {
  if (n >= 0) return fibBigInt(n);
  const value = fibBigInt(-n);
  return -n % 2 === 1 ? value : -value;
}

export function parseIntegerField(raw, { min = 0, max = MAX_INDEX, label = "value" } = {}) {
  const text = String(raw ?? "").trim().replace(/[,_\s]/g, "");
  if (!text) return { ok: false, error: `Enter a ${label}.` };
  if (!/^-?\d+$/.test(text)) return { ok: false, error: `The ${label} must be a whole number.` };
  const value = Number(text);
  if (!Number.isSafeInteger(value)) return { ok: false, error: `That ${label} is too large.` };
  if (value < min) return { ok: false, error: `The ${label} must be at least ${min.toLocaleString()}.` };
  if (value > max) return { ok: false, error: `The ${label} must be at most ${max.toLocaleString()}.` };
  return { ok: true, value };
}

export function parseBigIntField(raw) {
  const text = String(raw ?? "").trim().replace(/[,_\s]/g, "");
  if (!text) return { ok: false, error: "Enter a non-negative whole number." };
  if (!/^\d+$/.test(text)) return { ok: false, error: "Use digits only for this value." };
  if (text.length > 5000) return { ok: false, error: "That value is too long for the browser checker. Keep it under 5,000 digits." };
  try {
    return { ok: true, value: BigInt(text) };
  } catch {
    return { ok: false, error: "That number could not be parsed." };
  }
}

export function groupDigits(text, separator = ",") {
  if (!separator) return String(text);
  return String(text).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function formatTerm(value, maxDigits = 60, separator = ",") {
  const text = value.toString();
  if (text.length <= maxDigits) return groupDigits(text, separator);
  return `${groupDigits(text.slice(0, maxDigits), separator)}… (${text.length.toLocaleString()} digits)`;
}

export function countDigits(value) {
  return value.toString().length;
}

export function leadingDigits(value, count = 12) {
  return value.toString().slice(0, count);
}

export function approximateLog10(value) {
  const text = value.toString();
  if (text === "0") return -Infinity;
  if (text.length <= 15) return Math.log10(Number(text));
  return Math.log10(Number(`${text[0]}.${text.slice(1, 15)}`)) + (text.length - 1);
}

function buildStandardValues(maxAbs) {
  const values = [0n];
  if (maxAbs >= 1) values.push(1n);
  for (let index = 2; index <= maxAbs; index += 1) {
    values.push(values[index - 1] + values[index - 2]);
  }
  return values;
}

function valueAt(index, values, seeds, standard) {
  if (standard) {
    if (index >= 0) return values[index];
    const positive = values[-index];
    return -index % 2 === 1 ? positive : -positive;
  }
  return values[index];
}

function buildCustomValues(maxIndex, seedsA, seedsB) {
  const values = [seedsA, seedsB];
  for (let index = 2; index <= maxIndex; index += 1) {
    values.push(values[index - 1] + values[index - 2]);
  }
  return values;
}

export function generateTerms(startIndex, endIndex, step, seeds = { a: 0n, b: 1n }) {
  const a = seeds.a ?? 0n;
  const b = seeds.b ?? 1n;
  const standard = a === 0n && b === 1n;
  if (!standard && startIndex < 0) {
    throw new Error("Negative indices require the standard 0, 1 seeds.");
  }
  const low = Math.min(startIndex, endIndex);
  const high = Math.max(startIndex, endIndex);
  const maxAbs = standard ? Math.max(Math.abs(low), Math.abs(high)) : high;
  if (maxAbs > MAX_INDEX) throw new Error(`Indices are capped at ${MAX_INDEX.toLocaleString()}.`);
  const values = standard ? buildStandardValues(maxAbs) : buildCustomValues(maxAbs, a, b);
  const terms = [];
  const safeStep = Math.max(1, step);
  if (startIndex <= endIndex) {
    for (let index = startIndex; index <= endIndex; index += safeStep) {
      terms.push({ index, value: standard ? valueAt(index, values, seeds, true) : values[index] });
    }
  } else {
    for (let index = startIndex; index >= endIndex; index -= safeStep) {
      terms.push({ index, value: standard ? valueAt(index, values, seeds, true) : values[index] });
    }
  }
  return terms;
}

function isPrimeBigInt(value) {
  if (value < 2n) return false;
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  for (const prime of smallPrimes) {
    if (value === prime) return true;
    if (value % prime === 0n) return false;
  }
  let d = value - 1n;
  let s = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1;
  }
  const modPow = (base, exponent, modulus) => {
    let result = 1n;
    let current = base % modulus;
    let power = exponent;
    while (power > 0n) {
      if (power & 1n) result = (result * current) % modulus;
      current = (current * current) % modulus;
      power >>= 1n;
    }
    return result;
  };
  for (const base of smallPrimes) {
    if (base >= value) continue;
    let x = modPow(base, d, value);
    if (x === 1n || x === value - 1n) continue;
    let composite = true;
    for (let r = 1; r < s; r += 1) {
      x = (x * x) % value;
      if (x === value - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

export function buildSequence(options) {
  const {
    mode = "count",
    count = 20,
    rangeStart = "0",
    rangeEnd = "19",
    nth = "50",
    maxValue = "1000000",
    includeZero = true,
    step = 1,
    reverse = false,
    allowNegative = false,
    seedA = "0",
    seedB = "1",
  } = options;

  let a;
  let b;
  try {
    a = BigInt(String(seedA).replace(/[,_\s]/g, "") || "0");
    b = BigInt(String(seedB).replace(/[,_\s]/g, "") || "1");
  } catch {
    return { ok: false, error: "The seed values must be whole numbers." };
  }
  if (a < 0n || b < 0n) return { ok: false, error: "Seeds must be zero or positive." };
  const customSeeds = a !== 0n || b !== 1n;
  if (customSeeds && allowNegative) {
    // Negative extension is only defined for the standard sequence.
  }

  let terms = [];
  try {
    if (mode === "count") {
      const parsedCount = parseIntegerField(count, { min: 1, max: MAX_TERMS, label: "term count" });
      if (!parsedCount.ok) return parsedCount;
      const parsedStep = parseIntegerField(step, { min: 1, max: 1000, label: "step" });
      if (!parsedStep.ok) return parsedStep;
      const startIndex = includeZero ? 0 : 1;
      const endIndex = startIndex + (parsedCount.value - 1) * parsedStep.value;
      if (endIndex > MAX_INDEX) {
        return { ok: false, error: `That many terms would exceed the index cap of ${MAX_INDEX.toLocaleString()}.` };
      }
      terms = generateTerms(startIndex, endIndex, parsedStep.value, { a, b });
    } else if (mode === "range") {
      const parsedStart = parseIntegerField(rangeStart, {
        min: allowNegative && !customSeeds ? -MAX_INDEX : 0,
        max: MAX_INDEX,
        label: "start index",
      });
      if (!parsedStart.ok) return parsedStart;
      const parsedEnd = parseIntegerField(rangeEnd, {
        min: allowNegative && !customSeeds ? -MAX_INDEX : 0,
        max: MAX_INDEX,
        label: "end index",
      });
      if (!parsedEnd.ok) return parsedEnd;
      const parsedStep = parseIntegerField(step, { min: 1, max: 1000, label: "step" });
      if (!parsedStep.ok) return parsedStep;
      const span = Math.abs(parsedEnd.value - parsedStart.value) + 1;
      const termCount = Math.ceil(span / parsedStep.value);
      if (termCount > MAX_TERMS) {
        return { ok: false, error: `That range contains ${termCount.toLocaleString()} terms. Limit it to ${MAX_TERMS.toLocaleString()} terms.` };
      }
      if (parsedStart.value > parsedEnd.value) {
        return {
          ok: false,
          error: "The start index must be less than or equal to the end index. Use the reverse option for descending output.",
        };
      }
      terms = generateTerms(parsedStart.value, parsedEnd.value, parsedStep.value, { a, b });
    } else if (mode === "max") {
      const parsedMax = parseBigIntField(maxValue);
      if (!parsedMax.ok) return parsedMax;
      if (parsedMax.value < 0n) return { ok: false, error: "The upper bound must be non-negative." };
      let reachedBound = false;
      if (customSeeds) {
        const values = buildCustomValues(MAX_TERMS + 2, a, b);
        for (let cursor = 0; cursor < values.length; cursor += 1) {
          if (values[cursor] > parsedMax.value) {
            reachedBound = true;
            break;
          }
          if (cursor === 0 && !includeZero) continue;
          terms.push({ index: cursor, value: values[cursor] });
          if (terms.length > MAX_TERMS) break;
        }
      } else {
        for (let cursor = 0; cursor <= MAX_TERMS; cursor += 1) {
          const value = fibBigInt(cursor);
          if (value > parsedMax.value) {
            reachedBound = true;
            break;
          }
          if (cursor === 0 && !includeZero) continue;
          terms.push({ index: cursor, value });
          if (terms.length > MAX_TERMS) break;
        }
      }
      if (!reachedBound) {
        return {
          ok: false,
          error: `That upper bound needs more than ${MAX_TERMS.toLocaleString()} terms. Lower the bound or use an index range.`,
        };
      }
      if (terms.length > MAX_TERMS) terms = terms.slice(0, MAX_TERMS);
    } else if (mode === "nth") {
      const parsedNth = parseIntegerField(nth, {
        min: allowNegative && !customSeeds ? -MAX_INDEX : 0,
        max: MAX_INDEX,
        label: "index",
      });
      if (!parsedNth.ok) return parsedNth;
      const index = parsedNth.value;
      let value;
      if (customSeeds) {
        const values = buildCustomValues(Math.max(index, 1), a, b);
        value = values[index];
      } else if (index >= 0) {
        value = fibBigInt(index);
      } else {
        const positive = fibBigInt(-index);
        value = -index % 2 === 1 ? positive : -positive;
      }
      terms = [{ index, value }];
    } else {
      return { ok: false, error: "Choose a valid generation mode." };
    }
  } catch (error) {
    return { ok: false, error: error.message || "The sequence could not be generated." };
  }

  if (reverse) terms = [...terms].reverse();

  if (!terms.length) {
    return { ok: false, error: "No terms fit those settings. Increase the upper bound or change the range." };
  }

  const sum = terms.reduce((total, term) => total + term.value, 0n);
  const last = terms[terms.length - 1];
  const previous = terms.length > 1 ? terms[terms.length - 2] : null;
  const primeTerms = [];
  for (const term of terms) {
    if (term.value > 10n ** 15n) continue;
    if (isPrimeBigInt(term.value)) primeTerms.push(term);
  }
  const ratio =
    previous && countDigits(previous.value) <= 300 && previous.value !== 0n
      ? Number(last.value) / Number(previous.value)
      : null;

  return {
    ok: true,
    terms,
    stats: {
      count: terms.length,
      sum,
      sumDigits: countDigits(sum),
      lastIndex: last.index,
      lastValue: last.value,
      lastDigits: countDigits(last.value),
      maxDigits: Math.max(...terms.map((term) => countDigits(term.value))),
      minIndex: Math.min(...terms.map((term) => term.index)),
      maxIndex: Math.max(...terms.map((term) => term.index)),
      ratio,
      golden: PHI,
      primeTerms,
      checkedPrimes: terms.filter((term) => term.value <= 10n ** 15n).length,
      evenCount: terms.filter((term) => term.value % 2n === 0n).length,
      oddCount: terms.filter((term) => term.value % 2n !== 0n).length,
      zeroCount: terms.filter((term) => term.value === 0n).length,
      negativeCount: terms.filter((term) => term.value < 0n).length,
    },
  };
}

export function formatSequence(terms, options = {}) {
  const {
    format = "list",
    delimiter = "comma",
    customDelimiter = " ",
    maxDigits = 60,
    separator = ",",
    showIndex = false,
    indexBase = "0",
    prefix = "",
    suffix = "",
  } = options;
  const delimiterValue = delimiter === "custom" ? customDelimiter : DELIMITER_VALUES[delimiter] || ", ";
  const base = Number(indexBase) === 1 ? 1 : 0;

  if (format === "json") {
    return JSON.stringify(
      terms.map((term) => {
        const item = { index: term.index + base, value: term.value.toString() };
        return item;
      }),
      null,
      2,
    );
  }

  if (format === "csv") {
    const header = showIndex ? "index,value" : "value";
    const rows = terms.map((term) =>
      showIndex ? `${term.index + base},"${term.value.toString()}"` : `"${term.value.toString()}"`,
    );
    return [header, ...rows].join("\r\n");
  }

  if (format === "table") {
    return terms
      .map((term) => {
        const index = term.index + base;
        return showIndex
          ? `${groupDigits(String(index), separator)}: ${formatTerm(term.value, maxDigits, separator)}`
          : formatTerm(term.value, maxDigits, separator);
      })
      .join("\n");
  }

  return terms
    .map((term) => {
      const index = term.index + base;
      const value = formatTerm(term.value, maxDigits, separator);
      return showIndex ? `${prefix}${groupDigits(String(index), separator)}: ${value}${suffix}` : `${prefix}${value}${suffix}`;
    })
    .join(delimiterValue);
}

function bigIntSqrt(value) {
  if (value < 2n) return value;
  let x = value;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + value / x) / 2n;
  }
  return x;
}

function isPerfectSquare(value) {
  if (value < 0n) return false;
  const root = bigIntSqrt(value);
  return root * root === value;
}

export function checkFibonacci(raw) {
  const parsed = parseBigIntField(raw);
  if (!parsed.ok) return parsed;
  const value = parsed.value;
  if (value > 10n ** 5000n) {
    return { ok: false, error: "Keep the value below 10^5000 so the checker stays responsive." };
  }
  if (value === 0n) {
    return { ok: true, value, isFibonacci: true, index: 0, zeckendorf: [] };
  }
  const fiveNSquared = 5n * value * value;
  const isFib = isPerfectSquare(fiveNSquared + 4n) || isPerfectSquare(fiveNSquared - 4n);

  let index = null;
  if (isFib) {
    let low = 0;
    let high = Math.min(MAX_INDEX, Math.ceil((value.toString().length * Math.log(10)) / Math.log(PHI)) + 10);
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = fibBigInt(middle);
      if (candidate === value) {
        index = middle;
        break;
      }
      if (candidate < value) low = middle + 1;
      else high = middle - 1;
    }
  }

  return {
    ok: true,
    value,
    isFibonacci: isFib,
    index,
    digits: value.toString().length,
    log10: approximateLog10(value),
    zeckendorf: zeckendorf(value),
  };
}

export function zeckendorf(value) {
  if (value <= 0n) return [];
  const fibonacci = [1n, 2n];
  while (fibonacci[fibonacci.length - 1] <= value) {
    const next = fibonacci[fibonacci.length - 1] + fibonacci[fibonacci.length - 2];
    if (next > value) break;
    fibonacci.push(next);
  }
  const parts = [];
  let remaining = value;
  for (let index = fibonacci.length - 1; index >= 0 && remaining > 0n; index -= 1) {
    if (fibonacci[index] <= remaining) {
      // Map the stored value back to its Fibonacci index: F(2)=1, F(3)=2, ...
      const fibIndex = index + 2;
      parts.push({ index: fibIndex, value: fibonacci[index] });
      remaining -= fibonacci[index];
    }
  }
  return parts;
}

export function formatZeckendorf(parts) {
  if (!parts.length) return "0";
  return parts.map((part) => `F(${part.index})`).join(" + ");
}

export function buildFibReport(result, formatted, options) {
  if (!result?.ok) return "";
  return [
    "ToolsTrek — Fibonacci Generator",
    `Mode: ${options.mode}`,
    `Terms: ${result.stats.count}`,
    `Index range: ${result.stats.minIndex} … ${result.stats.maxIndex}`,
    `Last value digits: ${result.stats.lastDigits.toLocaleString()}`,
    `Sum digits: ${result.stats.sumDigits.toLocaleString()}`,
    `Output format: ${options.format}`,
    "",
    formatted,
  ].join("\n");
}

export function buildSequenceCsv(terms, showIndex = true, indexBase = 0) {
  const header = showIndex ? "index,value" : "value";
  const rows = terms.map((term) =>
    showIndex ? `${term.index + indexBase},"${term.value.toString()}"` : `"${term.value.toString()}"`,
  );
  return [header, ...rows].join("\r\n");
}
