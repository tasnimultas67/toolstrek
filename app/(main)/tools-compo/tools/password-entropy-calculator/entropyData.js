/* -------------------------------------------------------------------------- */
/*  Password Entropy Calculator — entropy, pattern penalties and crack times.  */
/*  The estimator is deliberately transparent: every deduction is explained.   */
/* -------------------------------------------------------------------------- */

export const COMMON_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "1234567",
  "111111", "1234567890", "123123", "abc123", "1234", "password1", "iloveyou",
  "1q2w3e4r", "000000", "qwerty123", "zaq12wsx", "dragon", "sunshine", "princess",
  "letmein", "654321", "monkey", "27653", "1qaz2wsx", "123321", "qwertyuiop",
  "superman", "asdfghjkl", "football", "welcome", "jesus", "michael", "ninja",
  "mustang", "password123", "trustno1", "batman", "master", "access", "shadow",
  "hello", "charlie", "donald", "freedom", "whatever", "qazwsx", "666666",
  "121212", "7777777", "555555", "888888", "999999", "112233", "131313",
  "2000", "2001", "2002", "2003", "2004", "1990", "1991", "1992", "1993",
  "admin", "root", "toor", "guest", "user", "test", "demo", "changeme",
  "secret", "passw0rd", "p@ssw0rd", "p@ssword", "admin123", "welcome1",
  "summer2024", "summer2023", "winter2024", "spring2024", "autumn2024",
  "january", "february", "december", "monday", "friday", "sunday",
  "starwars", "pokemon", "minecraft", "fortnite", "chelsea", "arsenal",
  "liverpool", "barcelona", "realmadrid", "yankees", "lakers", "cricket",
  "computer", "internet", "samsung", "iphone", "android", "google",
  "facebook", "instagram", "linkedin", "twitter", "github", "microsoft",
];

export const COMMON_WORDS = [
  "password", "admin", "welcome", "letmein", "master", "dragon", "monkey",
  "football", "baseball", "sunshine", "princess", "shadow", "superman",
  "batman", "iloveyou", "whatever", "freedom", "hello", "secret", "summer",
  "winter", "spring", "autumn", "january", "february", "march", "april",
  "august", "september", "october", "november", "december", "google",
  "facebook", "instagram", "linkedin", "github", "computer", "internet",
  "email", "login", "access", "service", "company", "manager", "office",
  "school", "college", "student", "teacher", "family", "mother", "father",
  "sister", "brother", "house", "money", "happy", "angel", "cookie",
  "chocolate", "coffee", "pizza", "soccer", "hockey", "basketball",
  "tennis", "guitar", "music", "movie", "games", "player", "friend",
  "love", "baby", "diamond", "killer", "wizard", "ninja", "pirate",
];

export const KEYBOARD_PATTERNS = [
  "qwerty", "qwertyuiop", "asdf", "asdfgh", "asdfghjkl", "zxcv", "zxcvbn",
  "zxcvbnm", "1234", "12345", "123456", "12345678", "abcdef", "654321",
  "0987654321", "1qaz", "2wsx", "qazwsx", "1q2w3e", "qweasd",
];

export const STRENGTH_LEVELS = [
  {
    key: "very-weak",
    label: "Very weak",
    tone: "rose",
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    key: "weak",
    label: "Weak",
    tone: "amber",
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "fair",
    label: "Fair",
    tone: "amber",
    bar: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    key: "strong",
    label: "Strong",
    tone: "emerald",
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "very-strong",
    label: "Very strong",
    tone: "emerald",
    bar: "bg-teal-500",
    text: "text-teal-600 dark:text-teal-400",
  },
  {
    key: "exceptional",
    label: "Exceptional",
    tone: "indigo",
    bar: "bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
  },
];

export const GUESS_RATES = [
  { value: "online-throttled", label: "Online, rate-limited", rate: 10, detail: "10 guesses / second" },
  { value: "online-fast", label: "Online, unthrottled", rate: 10000, detail: "10,000 guesses / second" },
  { value: "bcrypt", label: "Offline, slow hash (bcrypt)", rate: 10000, detail: "10,000 guesses / second" },
  { value: "sha256", label: "Offline, fast hash (SHA-256)", rate: 1e10, detail: "10 billion guesses / second" },
  { value: "gpu", label: "GPU rig (8 × RTX 4090)", rate: 1e12, detail: "1 trillion guesses / second" },
  { value: "cluster", label: "Nation-state cluster", rate: 1e15, detail: "1 quadrillion guesses / second" },
];

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

const LEET_MAP = {
  4: "a", 3: "e", 1: "i", 0: "o", 5: "s", 7: "t", 8: "b", 9: "g",
  "@": "a", $: "s", "!": "i", "+": "t",
};

export function deLeet(value) {
  return value
    .toLowerCase()
    .split("")
    .map((character) => LEET_MAP[character] ?? character)
    .join("");
}

export function getPool(password, extraPool = 0) {
  const counts = {
    lowercase: 0,
    uppercase: 0,
    digits: 0,
    symbols: 0,
    extended: 0,
  };
  for (const character of password) {
    if (character >= "a" && character <= "z") counts.lowercase += 1;
    else if (character >= "A" && character <= "Z") counts.uppercase += 1;
    else if (character >= "0" && character <= "9") counts.digits += 1;
    else if (character.codePointAt(0) > 126) counts.extended += 1;
    else counts.symbols += 1;
  }
  let pool = 0;
  if (counts.lowercase) pool += LOWERCASE.length;
  if (counts.uppercase) pool += UPPERCASE.length;
  if (counts.digits) pool += DIGITS.length;
  if (counts.symbols) pool += SYMBOLS.length;
  if (counts.extended) pool += 100;
  pool += Math.max(0, Number(extraPool) || 0);
  return {
    pool,
    counts,
    uniqueCharacters: new Set(password).size,
  };
}

export function entropyBits(pool, length) {
  if (!pool || !length) return 0;
  return length * Math.log2(pool);
}

function findSequenceRuns(value, alphabet) {
  const runs = [];
  let start = -1;
  let direction = 0;
  for (let index = 0; index < value.length; index += 1) {
    const current = alphabet.indexOf(value[index]);
    const previous = index > 0 ? alphabet.indexOf(value[index - 1]) : -1;
    if (current >= 0 && previous >= 0 && Math.abs(current - previous) === 1) {
      if (start === -1) {
        start = index - 1;
        direction = Math.sign(current - previous);
      } else if (Math.sign(current - previous) !== direction) {
        if (index - start >= 3) runs.push(value.slice(start, index));
        start = index - 1;
        direction = Math.sign(current - previous);
      }
    } else {
      if (start !== -1 && index - start >= 3) runs.push(value.slice(start, index));
      start = -1;
      direction = 0;
    }
  }
  if (start !== -1 && value.length - start >= 3) runs.push(value.slice(start));
  return runs;
}

export function analyzePassword(password, options = {}) {
  const { extraPool = 0, usePenalties = true } = options;
  const value = String(password ?? "");
  const length = [...value].length;
  const { pool, counts, uniqueCharacters } = getPool(value, extraPool);
  const baseBits = entropyBits(pool, length);
  const findings = [];

  const normalized = value.toLowerCase();
  const simple = normalized.replace(/[^a-z0-9]/g, "");
  const leet = deLeet(value).replace(/[^a-z0-9]/g, "");

  let commonRank = -1;
  COMMON_PASSWORDS.forEach((entry, index) => {
    if (commonRank !== -1) return;
    if (normalized === entry || simple === entry || leet === entry) commonRank = index;
  });

  if (commonRank !== -1) {
    findings.push({
      label: "Common password",
      detail: `“${value}” appears in public password breach lists. Attackers try it first.`,
      penalty: Math.max(0, baseBits - Math.log2(commonRank + 2)),
      severity: "critical",
    });
  }

  const repeatedRuns = [...normalized.matchAll(/(.)\1{2,}/g)].map((match) => match[0]);
  repeatedRuns.forEach((run) => {
    findings.push({
      label: "Repeated characters",
      detail: `“${run}” repeats ${run.length} times in a row.`,
      penalty: Math.min(14, (run.length - 2) * 1.6),
      severity: "medium",
    });
  });

  [...findSequenceRuns(normalized, "abcdefghijklmnopqrstuvwxyz"), ...findSequenceRuns(normalized, "0123456789")].forEach(
    (run) => {
      findings.push({
        label: "Sequence",
        detail: `“${run}” is a predictable run of consecutive characters.`,
        penalty: Math.min(16, (run.length - 2) * 2.2),
        severity: "medium",
      });
    },
  );

  const keyboard = KEYBOARD_PATTERNS.filter((pattern) => normalized.includes(pattern));
  keyboard.slice(0, 2).forEach((pattern) => {
    findings.push({
      label: "Keyboard pattern",
      detail: `“${pattern}” follows an adjacent-key path on a standard keyboard.`,
      penalty: 11,
      severity: "medium",
    });
  });

  const yearMatch = normalized.match(/(?:19|20)\d{2}/);
  if (yearMatch) {
    findings.push({
      label: "Year or date",
      detail: `“${yearMatch[0]}” looks like a year, which is a very common password suffix.`,
      penalty: 8,
      severity: "low",
    });
  }

  if (/\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/.test(normalized)) {
    findings.push({
      label: "Date pattern",
      detail: "The password contains a readable date, shrinking the search space.",
      penalty: 9,
      severity: "low",
    });
  }

  const foundWords = [];
  COMMON_WORDS.forEach((word) => {
    if (word.length >= 4 && (simple.includes(word) || leet.includes(word)) && !foundWords.includes(word)) {
      foundWords.push(word);
    }
  });
  foundWords.slice(0, 3).forEach((word) => {
    findings.push({
      label: "Dictionary word",
      detail: `“${word}” is a common dictionary word or brand name.`,
      penalty: 7,
      severity: "medium",
    });
  });

  if (length >= 8 && uniqueCharacters / length < 0.5) {
    findings.push({
      label: "Low character variety",
      detail: `Only ${uniqueCharacters} unique characters appear in ${length} positions.`,
      penalty: 4,
      severity: "low",
    });
  }

  const rawPenalty = findings.reduce((sum, finding) => sum + finding.penalty, 0);
  const maxPenalty = usePenalties ? baseBits * 0.72 : 0;
  const penalty = Math.min(rawPenalty, maxPenalty);
  const bits = Math.max(0, baseBits - penalty);

  const shannon = shannonEntropy(value);
  const adjustedBits = usePenalties ? bits : baseBits;
  const level = strengthFor(adjustedBits);
  const perCharacter = pool > 1 ? Math.log2(pool) : 0;
  const targetBits = 80;
  const extraCharacters =
    perCharacter > 0 ? Math.max(0, Math.ceil((targetBits - adjustedBits) / perCharacter)) : 0;

  return {
    value,
    length,
    pool,
    counts,
    uniqueCharacters,
    baseBits,
    adjustedBits,
    bits: adjustedBits,
    penalty,
    shannon,
    shannonBits: shannon * length,
    findings,
    level,
    perCharacter,
    extraCharacters,
    guessLog10: adjustedBits > 0 ? (adjustedBits - 1) * Math.log10(2) : 0,
    isCommon: commonRank !== -1,
  };
}

function shannonEntropy(value) {
  if (!value.length) return 0;
  const counts = {};
  for (const character of value) counts[character] = (counts[character] || 0) + 1;
  return Object.values(counts).reduce((sum, count) => {
    const probability = count / [...value].length;
    return sum - probability * Math.log2(probability);
  }, 0);
}

export function strengthFor(bits) {
  if (!bits) return { level: STRENGTH_LEVELS[0], index: 0, percent: 0 };
  if (bits < 28) return { level: STRENGTH_LEVELS[0], index: 0, percent: 16 };
  if (bits < 36) return { level: STRENGTH_LEVELS[1], index: 1, percent: 33 };
  if (bits < 60) return { level: STRENGTH_LEVELS[2], index: 2, percent: 50 };
  if (bits < 80) return { level: STRENGTH_LEVELS[3], index: 3, percent: 67 };
  if (bits < 128) return { level: STRENGTH_LEVELS[4], index: 4, percent: 84 };
  return { level: STRENGTH_LEVELS[5], index: 5, percent: 100 };
}

/* -------------------------------------------------------------------------- */
/*  Crack-time maths                                                           */
/* -------------------------------------------------------------------------- */

export function crackLog10Seconds(bits, rate) {
  if (!bits || !rate) return 0;
  return (bits - 1) * Math.log10(2) - Math.log10(rate);
}

export function formatBigDuration(log10Seconds) {
  if (!Number.isFinite(log10Seconds)) return "—";
  if (log10Seconds < -4) return "instantly";
  if (log10Seconds < Math.log10(60)) {
    return `${Math.max(1, 10 ** log10Seconds).toFixed(1)} seconds`;
  }
  if (log10Seconds < Math.log10(3600)) {
    return `${(10 ** log10Seconds / 60).toFixed(1)} minutes`;
  }
  if (log10Seconds < Math.log10(86400)) {
    return `${(10 ** log10Seconds / 3600).toFixed(1)} hours`;
  }
  if (log10Seconds < Math.log10(31557600)) {
    return `${(10 ** log10Seconds / 86400).toFixed(1)} days`;
  }
  const log10Years = log10Seconds - Math.log10(31557600);
  if (log10Years < 3) {
    return `${Math.max(1, Math.round(10 ** log10Years)).toLocaleString()} years`;
  }
  if (log10Years < 6) {
    return `${(10 ** log10Years / 1000).toFixed(1)} thousand years`;
  }
  if (log10Years < 9) {
    return `${(10 ** log10Years / 1e6).toFixed(1)} million years`;
  }
  if (log10Years < 12) {
    return `${(10 ** log10Years / 1e9).toFixed(1)} billion years`;
  }
  if (log10Years < 100) {
    return `10^${Math.round(log10Years)} years`;
  }
  return "longer than the universe has existed";
}

export function crackTimesFor(analysis, customRate) {
  return GUESS_RATES.map((entry) => {
    const rate = entry.value === "custom" ? customRate : entry.rate;
    const log10Seconds = crackLog10Seconds(analysis.bits, rate);
    return {
      ...entry,
      rate,
      log10Seconds,
      display: formatBigDuration(log10Seconds),
    };
  });
}

export function formatGuesses(bits) {
  if (!bits) return "1";
  const log10 = (bits - 1) * Math.log10(2);
  if (log10 < 4) return Math.max(1, Math.round(10 ** log10)).toLocaleString();
  return `≈ 10^${log10.toFixed(0)}`;
}

/* -------------------------------------------------------------------------- */
/*  Passphrase helper                                                          */
/* -------------------------------------------------------------------------- */

export const PASSPHRASE_WORDS = [
  "amber", "anchor", "apple", "arrow", "atlas", "autumn", "bamboo", "beacon",
  "berry", "bison", "bloom", "bolt", "breeze", "bridge", "bronze", "bubble",
  "cabin", "cactus", "camera", "candle", "canyon", "carbon", "castle", "cedar",
  "cherry", "circle", "cliff", "cloud", "cobalt", "comet", "copper", "coral",
  "cosmic", "cotton", "crane", "crystal", "daisy", "dawn", "delta", "desert",
  "dolphin", "dragon", "dune", "eagle", "earth", "echo", "ember", "emerald",
  "falcon", "feather", "fern", "field", "flame", "flint", "forest", "fossil",
  "fox", "frost", "galaxy", "garden", "ghost", "glacier", "glade", "globe",
  "gold", "granite", "grape", "grove", "harbor", "hazel", "honey", "horizon",
  "ice", "indigo", "island", "ivory", "jade", "jasmine", "jungle", "kite",
  "lagoon", "lantern", "leaf", "lemon", "lily", "linen", "lunar", "maple",
  "marble", "meadow", "meteor", "mint", "mist", "moon", "moss", "mountain",
  "nebula", "nectar", "night", "north", "oasis", "ocean", "olive", "onyx",
  "opal", "orbit", "orchid", "otter", "panda", "pearl", "pebble", "pine",
  "planet", "plum", "polar", "pond", "poppy", "prairie", "prism", "quartz",
  "quiet", "raven", "reef", "river", "robin", "rocket", "rose", "ruby",
  "saffron", "sage", "sail", "sand", "sapphire", "scarlet", "shadow", "shell",
  "silver", "sky", "slate", "snow", "solar", "sparrow", "spring", "spruce",
  "star", "stone", "storm", "stream", "summer", "sun", "sunset", "swan",
  "tiger", "timber", "topaz", "trail", "tulip", "tundra", "turtle", "valley",
  "velvet", "violet", "wave", "willow", "wind", "winter", "wolf", "zebra",
  "zenith", "zephyr",
];

export const PASSPHRASE_ENTROPY_PER_WORD = Math.log2(PASSPHRASE_WORDS.length);

function secureRandomIndex(max) {
  if (typeof window === "undefined" || !window.crypto?.getRandomValues) {
    return Math.floor(Math.random() * max);
  }
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return values[0] % max;
}

export function generatePassphrase({ count = 5, separator = "-", randomCase = true, addNumber = true }) {
  const total = Math.max(2, Math.min(16, Number(count) || 5));
  const words = Array.from({ length: total }, () => PASSPHRASE_WORDS[secureRandomIndex(PASSPHRASE_WORDS.length)]);
  const styled = words.map((word) => {
    if (!randomCase) return word;
    const upper = secureRandomIndex(2) === 1;
    return upper ? word[0].toUpperCase() + word.slice(1) : word;
  });
  const number = addNumber ? String(secureRandomIndex(100)).padStart(2, "0") : "";
  const phrase = [...styled, ...(addNumber ? [number] : [])].join(separator);
  const bits =
    total * PASSPHRASE_ENTROPY_PER_WORD +
    (randomCase ? total : 0) +
    (addNumber ? Math.log2(100) : 0);
  return { phrase, bits, words: total };
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export const PASSWORD_ENTROPY_FAQS = [
  {
    question: "What is password entropy?",
    answer:
      "Entropy measures how unpredictable a password is, in bits. Every extra bit doubles the number of guesses an attacker needs. A random 12-character password using upper case, lower case, digits and symbols has roughly 78 bits of entropy, while a common word can have fewer than 10.",
  },
  {
    question: "Why is the adjusted entropy lower than length × log₂(pool)?",
    answer:
      "The raw formula assumes every character is independent and random. Real passwords often contain repeats, sequences, keyboard walks, years and dictionary words. The calculator detects those patterns and deducts the bits they save an attacker, so the adjusted number is closer to reality.",
  },
  {
    question: "How are crack times calculated?",
    answer:
      "Crack time is 2^(bits − 1) divided by a guessing rate. The table shows several realistic rates: online throttled attacks, online unthrottled attacks, bcrypt, fast hashes, a GPU rig and a nation-state cluster. The result is an average, not a guarantee.",
  },
  {
    question: "Is a longer password always stronger?",
    answer:
      "Length usually matters more than complexity, but only if the extra characters are unpredictable. Twenty repeated characters are easy to guess, while five random words from a large list (a passphrase) can be both long and memorable. The passphrase tab shows the maths.",
  },
  {
    question: "Is my password sent anywhere?",
    answer:
      "No. Everything runs in your browser using JavaScript. The password is never transmitted, stored, logged or included in analytics. You can disconnect from the internet after the page loads and the calculator will keep working.",
  },
  {
    question: "What entropy should I aim for?",
    answer:
      "For most online accounts, 60–80 bits is comfortable. For password-manager master passwords, disk encryption and offline hashes, aim for 100 bits or more. Passphrases with 5–7 random words from a 256-word list reach that range quickly.",
  },
];
