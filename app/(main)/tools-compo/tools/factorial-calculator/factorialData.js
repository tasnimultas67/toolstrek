/* -------------------------------------------------------------------------- */
/*  Factorial Calculator — exact BigInt maths and formatting helpers          */
/* -------------------------------------------------------------------------- */

export const FACTORIAL_FAQS = [
  {
    question: "Why is 0! equal to 1?",
    answer:
      "A factorial counts the number of ways to arrange n distinct objects. There is exactly one way to arrange nothing: the empty arrangement. The recurrence n! = n × (n − 1)! also only stays consistent for n = 1 if 0! = 1.",
  },
  {
    question: "How large a factorial can I calculate here?",
    answer:
      "The calculator uses BigInt, so the result is exact rather than a floating-point approximation. The input is capped at 10,000 to keep the page responsive; 10,000! has 35,660 digits. Display truncation only affects what is shown, never the stored exact value, and you can copy or download the full result.",
  },
  {
    question: "Why does a normal calculator overflow at 171!?",
    answer:
      "JavaScript's Number type follows IEEE-754 double precision. The largest finite value is about 1.8 × 10^308, and 170! is about 7.26 × 10^306. Anything from 171! onward becomes Infinity in floating point. This tool computes with arbitrary-precision integers, so that limit does not apply.",
  },
  {
    question: "How are trailing zeros of n! calculated?",
    answer:
      "A trailing zero appears whenever a factor of 10 is formed by a 2 and a 5. There are always more 2s than 5s, so the count is the number of factors of 5 in n!. Legendre's formula gives that as floor(n/5) + floor(n/25) + floor(n/125) + … until the divisor exceeds n.",
  },
  {
    question: "What is a double factorial?",
    answer:
      "n!! is the product of every other integer down from n: 6!! = 6 × 4 × 2 = 48 and 7!! = 7 × 5 × 3 × 1 = 105. It is not (n!)!, which grows unimaginably faster.",
  },
  {
    question: "What is a subfactorial?",
    answer:
      "!n, read as the subfactorial or derangement number, counts permutations of n items where no item stays in its original position. The recurrence is D(n) = (n − 1) × (D(n − 1) + D(n − 2)), with D(0) = 1 and D(1) = 0.",
  },
  {
    question: "How accurate is Stirling's approximation?",
    answer:
      "Stirling's formula n! ≈ √(2πn) × (n/e)^n is extremely accurate in relative terms for large n. The relative error is roughly 1/(12n), so it is about 0.8% at n = 10 and under 0.01% at n = 1,000. It is useful for logs and asymptotics, not for exact digits.",
  },
  {
    question: "Are combinations and permutations computed exactly too?",
    answer:
      "Yes. nPr and nCr are derived from exact BigInt factorials, so there is no rounding. They are shown when the related-values option is enabled.",
  },
];

export const MODES = [
  { value: "standard", label: "n!" },
  { value: "double", label: "n!!" },
  { value: "subfactorial", label: "!n" },
];

export const NOTATIONS = [
  { value: "full", label: "Full" },
  { value: "scientific", label: "Scientific" },
  { value: "compact", label: "Compact" },
];

export const PRESETS = [
  { label: "5!", n: 5 },
  { label: "10!", n: 10 },
  { label: "20!", n: 20 },
  { label: "50!", n: 50 },
  { label: "100!", n: 100 },
  { label: "170!", n: 170 },
  { label: "500!", n: 500 },
  { label: "1,000!", n: 1000 },
];

export const MAX_INPUT = 10000;

export function factorialBigInt(n) {
  if (n < 0) throw new Error("Factorial is not defined for negative integers.");
  let result = 1n;
  for (let index = 2; index <= n; index += 1) {
    result *= BigInt(index);
  }
  return result;
}

export function doubleFactorialBigInt(n) {
  if (n < 0) throw new Error("Double factorial is not defined for negative integers.");
  let result = 1n;
  for (let index = n; index > 1; index -= 2) {
    result *= BigInt(index);
  }
  return result;
}

export function subfactorialBigInt(n) {
  if (n < 0) throw new Error("Subfactorial is not defined for negative integers.");
  if (n === 0) return 1n;
  if (n === 1) return 0n;
  let previous = 1n;
  let current = 0n;
  for (let index = 2; index <= n; index += 1) {
    const next = BigInt(index - 1) * (previous + current);
    previous = current;
    current = next;
  }
  return current;
}

export function computeValue(n, mode = "standard") {
  if (mode === "double") return doubleFactorialBigInt(n);
  if (mode === "subfactorial") return subfactorialBigInt(n);
  return factorialBigInt(n);
}

export function parseFactorialInput(raw, max = MAX_INPUT) {
  const text = String(raw ?? "").trim();
  if (!text) {
    return { ok: false, error: "Enter a whole number to calculate its factorial." };
  }
  if (/^-/.test(text)) {
    return {
      ok: false,
      error: "Factorials are only defined for non-negative integers. The gamma function extends the idea to other values, but it is not the same operation.",
    };
  }
  if (/[.,]/.test(text.replace(/[,_\s]/g, ""))) {
    return {
      ok: false,
      error: "Enter a whole number. Decimals require the gamma function, which is outside this exact-integer calculator.",
    };
  }
  const cleaned = text.replace(/[,_\s]/g, "");
  if (!/^\d+$/.test(cleaned)) {
    return {
      ok: false,
      error: "Use digits only. Letters, symbols and scientific notation are not accepted.",
    };
  }
  if (cleaned.length > 6) {
    return { ok: false, error: `That number is larger than the ${max.toLocaleString()} limit for this tool.` };
  }
  const n = Number(cleaned);
  if (!Number.isSafeInteger(n)) {
    return { ok: false, error: "That number is too large to represent safely." };
  }
  if (n > max) {
    return {
      ok: false,
      error: `Please use a number between 0 and ${max.toLocaleString()}. Higher values are intentionally blocked to keep the page responsive.`,
    };
  }
  return { ok: true, n };
}

export function digitCount(value) {
  return value.toString().length;
}

export function countTrailingZeros(value) {
  const text = value.toString();
  let count = 0;
  for (let index = text.length - 1; index >= 0; index -= 1) {
    if (text[index] !== "0") break;
    count += 1;
  }
  return count;
}

export function leadingDigits(value, count = 12) {
  return value.toString().slice(0, count);
}

export function groupDigits(text, separator = ",") {
  if (!separator) return text;
  return String(text).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function toScientific(value, precision = 8) {
  const text = value.toString();
  if (text === "0") return { mantissa: "0", exponent: 0, text: "0" };
  const exponent = text.length - 1;
  const head = text.slice(0, precision + 1);
  const mantissa = head.length > 1 ? `${head[0]}.${head.slice(1)}` : head;
  return {
    mantissa,
    exponent,
    text: `${mantissa} × 10^${exponent}`,
  };
}

export function approximateLog10(value) {
  const text = value.toString();
  if (text === "0") return -Infinity;
  if (text.length <= 15) return Math.log10(Number(text));
  return Math.log10(Number(`${text[0]}.${text.slice(1, 15)}`)) + (text.length - 1);
}

export function stirlingLog10(n) {
  if (n <= 0) return 0;
  return 0.5 * Math.log10(2 * Math.PI * n) + n * Math.log10(n / Math.E);
}

export function stirlingRelativeError(n) {
  if (n <= 0) return 0;
  return 1 / (12 * n);
}

export function factorialTrailingZeros(n) {
  let count = 0;
  let divisor = 5;
  while (divisor <= n) {
    count += Math.floor(n / divisor);
    divisor *= 5;
  }
  return count;
}

function primesUpTo(limit) {
  const sieve = new Uint8Array(limit + 1);
  const primes = [];
  for (let index = 2; index <= limit; index += 1) {
    if (sieve[index]) continue;
    primes.push(index);
    for (let multiple = index * index; multiple <= limit; multiple += index) {
      sieve[multiple] = 1;
    }
  }
  return primes;
}

export function primeFactorizationFactorial(n) {
  if (n < 2) return [];
  const primes = primesUpTo(n);
  return primes.map((prime) => {
    let exponent = 0;
    let power = prime;
    while (power <= n) {
      exponent += Math.floor(n / power);
      power *= prime;
    }
    return { prime, exponent };
  });
}

export function formatProduct(factors, maxTerms = 80) {
  if (!factors.length) return "";
  const terms = factors.slice(0, maxTerms).map(({ prime, exponent }) =>
    exponent === 1 ? `${prime}` : `${prime}^${exponent}`,
  );
  return `${terms.join(" × ")}${factors.length > maxTerms ? ` × … (${factors.length - maxTerms} more primes)` : ""}`;
}

export function buildSteps(n, mode) {
  if (mode === "standard") {
    if (n === 0) return "0! = 1 (the empty product)";
    if (n <= 12) return `${n}! = ${Array.from({ length: n }, (_, index) => n - index).join(" × ")} = ${factorialBigInt(n)}`;
    return `${n}! = ${n} × ${n - 1} × ${n - 2} × … × 3 × 2 × 1`;
  }
  if (mode === "double") {
    if (n <= 12) {
      const terms = [];
      for (let index = n; index > 1; index -= 2) terms.push(index);
      return `${n}!! = ${terms.length ? terms.join(" × ") : "1"} = ${doubleFactorialBigInt(n)}`;
    }
    return `${n}!! = ${n} × ${n - 2} × ${n - 4} × … × ${n % 2 === 0 ? 2 : 1}`;
  }
  if (n === 0) return "!0 = 1 (one way to arrange nothing)";
  if (n <= 10) {
    return `!${n} = ${n} × (!${n - 1} + !${n - 2}) = ${subfactorialBigInt(n)}`;
  }
  return `!${n} = (${n} − 1) × (!${n - 1} + !${n - 2})`;
}

export function permutations(n, r) {
  if (!Number.isInteger(n) || !Number.isInteger(r) || r < 0 || r > n) return null;
  let result = 1n;
  for (let index = 0; index < r; index += 1) {
    result *= BigInt(n - index);
  }
  return result;
}

export function combinations(n, r) {
  if (!Number.isInteger(n) || !Number.isInteger(r) || r < 0 || r > n) return null;
  const k = Math.min(r, n - r);
  let result = 1n;
  for (let index = 0; index < k; index += 1) {
    result = (result * BigInt(n - index)) / BigInt(index + 1);
  }
  return result;
}

export function formatBigNumber(value, options = {}) {
  const {
    notation = "full",
    separator = ",",
    maxDigits = 1000,
    precision = 8,
  } = options;
  const text = value.toString();
  const digits = text.length;

  if (notation === "scientific") {
    const scientific = toScientific(value, precision);
    return {
      text: scientific.text,
      digits,
      truncated: false,
      exponent: scientific.exponent,
      mantissa: scientific.mantissa,
      fullLength: text.length,
    };
  }

  if (notation === "compact") {
    const scientific = toScientific(value, precision);
    const exponent = scientific.exponent;
    if (exponent > 33) {
      return {
        text: scientific.text,
        digits,
        truncated: false,
        exponent,
        mantissa: scientific.mantissa,
        fullLength: text.length,
      };
    }
    const suffixes = [
      { limit: 33, suffix: "decillion" },
      { limit: 30, suffix: "nonillion" },
      { limit: 27, suffix: "octillion" },
      { limit: 24, suffix: "septillion" },
      { limit: 21, suffix: "sextillion" },
      { limit: 18, suffix: "quintillion" },
      { limit: 15, suffix: "quadrillion" },
      { limit: 12, suffix: "trillion" },
      { limit: 9, suffix: "billion" },
      { limit: 6, suffix: "million" },
      { limit: 3, suffix: "thousand" },
    ];
    const match = suffixes.find((item) => exponent >= item.limit);
    const scaled = Number(scientific.mantissa) * 10 ** (exponent - (match?.limit || 0));
    const shortText = match
      ? `${scaled.toFixed(2)} ${match.suffix}`
      : groupDigits(text, separator);
    return {
      text: shortText,
      digits,
      truncated: false,
      exponent,
      mantissa: scientific.mantissa,
      fullLength: text.length,
    };
  }

  if (digits > maxDigits) {
    return {
      text: `${groupDigits(text.slice(0, maxDigits), separator)}…`,
      digits,
      truncated: true,
      exponent: digits - 1,
      mantissa: text.slice(0, precision),
      fullLength: text.length,
    };
  }

  return {
    text: groupDigits(text, separator),
    digits,
    truncated: false,
    exponent: digits - 1,
    mantissa: text.slice(0, precision),
    fullLength: text.length,
  };
}

export function buildFactorialReport(result) {
  if (!result?.ok) return "";
  return [
    "ToolsTrek — Factorial Calculator",
    `Input: ${result.n}`,
    `Operation: ${result.modeLabel}`,
    `Exact digits: ${result.digits.toLocaleString()}`,
    `Trailing zeros: ${result.trailingZeros.toLocaleString()}`,
    `log10: ${result.log10.toFixed(8)}`,
    `Leading digits: ${result.leading}`,
    "",
    "Exact value:",
    result.value.toString(),
  ].join("\n");
}
