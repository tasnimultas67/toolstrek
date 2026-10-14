// app/(main)/tools-compo/tools/calendar-generator/calendarData.js

// ─────────────────────────────────────────────────────────────
// Page Size Presets (dimensions in mm, inches, and px)
// ─────────────────────────────────────────────────────────────
export const PAGE_SIZES = [
  { id: "a4", name: "A4 Standard", widthMm: 210, heightMm: 297, desc: "210 × 297 mm • Most common global format" },
  { id: "a3", name: "A3 Large Poster", widthMm: 297, heightMm: 420, desc: "297 × 420 mm • Great for wall calendars" },
  { id: "a5", name: "A5 Compact", widthMm: 148, heightMm: 210, desc: "148 × 210 mm • Desk & bullet planner size" },
  { id: "letter", name: "US Letter", widthMm: 215.9, heightMm: 279.4, desc: "8.5 × 11.0 in • Standard North America" },
  { id: "legal", name: "US Legal", widthMm: 215.9, heightMm: 355.6, desc: "8.5 × 14.0 in • Extended vertical format" },
  { id: "tabloid", name: "Tabloid / Ledger", widthMm: 279.4, heightMm: 431.8, desc: "11.0 × 17.0 in • Poster & newspaper size" },
  { id: "wallpaper", name: "Desktop Wallpaper (16:9)", widthMm: 384, heightMm: 216, desc: "1920 × 1080 px equivalent • 16:9 display" },
  { id: "wallpaper4k", name: "4K UHD Display (16:9)", widthMm: 508, heightMm: 285.75, desc: "3840 × 2160 px equivalent • 4K screen" },
  { id: "square", name: "Square (1:1)", widthMm: 250, heightMm: 250, desc: "1080 × 1080 px • Social & modern frame" },
  { id: "photo4x6", name: "Photo 4 × 6 in", widthMm: 101.6, heightMm: 152.4, desc: "101.6 × 152.4 mm • Frame & postcard" },
  { id: "photo5x7", name: "Photo 5 × 7 in", widthMm: 127, heightMm: 177.8, desc: "127 × 177.8 mm • Desk picture frame" },
  { id: "custom", name: "Custom Dimensions...", widthMm: 210, heightMm: 297, desc: "Define exact mm, inches, or pixels" },
];

export const MM_PER_INCH = 25.4;
export const PX_PER_INCH = 96;
export const MM_PER_PX = MM_PER_INCH / PX_PER_INCH; // ~0.264583

export function convertToMm(val, unit) {
  const n = parseFloat(val) || 0;
  if (unit === "in") return n * MM_PER_INCH;
  if (unit === "px") return n * MM_PER_PX;
  return n; // mm
}

export function convertFromMm(mmVal, unit) {
  if (unit === "in") return (mmVal / MM_PER_INCH).toFixed(2);
  if (unit === "px") return Math.round(mmVal / MM_PER_PX);
  return Math.round(mmVal);
}

// ─────────────────────────────────────────────────────────────
// Designer Themes
// ─────────────────────────────────────────────────────────────
export const THEMES = {
  nordicSlate: {
    id: "nordicSlate",
    name: "Nordic Slate",
    primary: "#0f172a",
    primaryText: "#ffffff",
    headerBg: "#1e293b",
    headerText: "#f8fafc",
    weekendBg: "#f8fafc",
    weekendText: "#475569",
    holidayBadge: "#e11d48",
    holidayBg: "#fff1f2",
    paperBg: "#ffffff",
    borderColor: "#e2e8f0",
    dateColor: "#0f172a",
    dimmedDateColor: "#cbd5e1",
    accent: "#3b82f6",
    isDark: false,
  },
  swissMinimal: {
    id: "swissMinimal",
    name: "Swiss Minimal",
    primary: "#18181b",
    primaryText: "#ffffff",
    headerBg: "#f4f4f5",
    headerText: "#18181b",
    weekendBg: "#fafafa",
    weekendText: "#52525b",
    holidayBadge: "#dc2626",
    holidayBg: "#fef2f2",
    paperBg: "#ffffff",
    borderColor: "#e4e4e7",
    dateColor: "#18181b",
    dimmedDateColor: "#d4d4d8",
    accent: "#18181b",
    isDark: false,
  },
  royalIndigo: {
    id: "royalIndigo",
    name: "Royal Indigo",
    primary: "#4338ca",
    primaryText: "#ffffff",
    headerBg: "#4f46e5",
    headerText: "#ffffff",
    weekendBg: "#eef2ff",
    weekendText: "#4338ca",
    holidayBadge: "#ea580c",
    holidayBg: "#fff7ed",
    paperBg: "#ffffff",
    borderColor: "#c7d2fe",
    dateColor: "#1e1b4b",
    dimmedDateColor: "#c7d2fe",
    accent: "#6366f1",
    isDark: false,
  },
  emeraldSage: {
    id: "emeraldSage",
    name: "Sage & Botanical",
    primary: "#065f46",
    primaryText: "#ffffff",
    headerBg: "#047857",
    headerText: "#ffffff",
    weekendBg: "#ecfdf5",
    weekendText: "#065f46",
    holidayBadge: "#b45309",
    holidayBg: "#fffbeb",
    paperBg: "#fafaf9",
    borderColor: "#a7f3d0",
    dateColor: "#064e3b",
    dimmedDateColor: "#cbd5e1",
    accent: "#10b981",
    isDark: false,
  },
  sunsetCoral: {
    id: "sunsetCoral",
    name: "Sunset Coral",
    primary: "#be123c",
    primaryText: "#ffffff",
    headerBg: "#f43f5e",
    headerText: "#ffffff",
    weekendBg: "#fff1f2",
    weekendText: "#be123c",
    holidayBadge: "#d97706",
    holidayBg: "#fffbeb",
    paperBg: "#ffffff",
    borderColor: "#fecdd3",
    dateColor: "#881337",
    dimmedDateColor: "#fecdd3",
    accent: "#fb7185",
    isDark: false,
  },
  warmTerracotta: {
    id: "warmTerracotta",
    name: "Warm Terracotta",
    primary: "#9a3412",
    primaryText: "#ffffff",
    headerBg: "#c2410c",
    headerText: "#ffffff",
    weekendBg: "#fff7ed",
    weekendText: "#9a3412",
    holidayBadge: "#be185d",
    holidayBg: "#fdf2f8",
    paperBg: "#fffdfa",
    borderColor: "#fed7aa",
    dateColor: "#431407",
    dimmedDateColor: "#fed7aa",
    accent: "#ea580c",
    isDark: false,
  },
  oceanTeal: {
    id: "oceanTeal",
    name: "Ocean Teal",
    primary: "#0f766e",
    primaryText: "#ffffff",
    headerBg: "#0d9488",
    headerText: "#ffffff",
    weekendBg: "#f0fdfa",
    weekendText: "#0f766e",
    holidayBadge: "#e11d48",
    holidayBg: "#fff1f2",
    paperBg: "#ffffff",
    borderColor: "#99f6e4",
    dateColor: "#134e4a",
    dimmedDateColor: "#99f6e4",
    accent: "#14b8a6",
    isDark: false,
  },
  cyberDark: {
    id: "cyberDark",
    name: "Obsidian Dark",
    primary: "#030712",
    primaryText: "#f9fafb",
    headerBg: "#111827",
    headerText: "#60a5fa",
    weekendBg: "#111827",
    weekendText: "#94a3b8",
    holidayBadge: "#f43f5e",
    holidayBg: "#371b26",
    paperBg: "#030712",
    borderColor: "#1f2937",
    dateColor: "#f9fafb",
    dimmedDateColor: "#4b5563",
    accent: "#38bdf8",
    isDark: true,
  },
  inkSaver: {
    id: "inkSaver",
    name: "Print-Friendly (Ink Saver)",
    primary: "#000000",
    primaryText: "#000000",
    headerBg: "#ffffff",
    headerText: "#000000",
    weekendBg: "#ffffff",
    weekendText: "#555555",
    holidayBadge: "#000000",
    holidayBg: "#ffffff",
    paperBg: "#ffffff",
    borderColor: "#333333",
    dateColor: "#000000",
    dimmedDateColor: "#bbbbbb",
    accent: "#000000",
    isDark: false,
    isInkSaver: true,
  },
};

// ─────────────────────────────────────────────────────────────
// Font Options
// ─────────────────────────────────────────────────────────────
export const FONT_OPTIONS = [
  { id: "inter", name: "Inter (Modern Sans)", family: "var(--font-sans), Inter, sans-serif" },
  { id: "outfit", name: "Outfit (Geometric Display)", family: "Outfit, system-ui, sans-serif" },
  { id: "playfair", name: "Playfair (Luxury Serif)", family: "var(--font-playfairDisplay), 'Playfair Display', Georgia, serif" },
  { id: "robotoMono", name: "Space Mono (Technical)", family: "var(--font-mono), 'Space Mono', monospace" },
  { id: "system", name: "System Clean", family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
];

// ─────────────────────────────────────────────────────────────
// Countries & Regions
// ─────────────────────────────────────────────────────────────
export const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "GLOBAL", name: "International / UN", flag: "🌐" },
  { code: "NONE", name: "None (No Holidays)", flag: "🚫" },
];

// ─────────────────────────────────────────────────────────────
// Month Names & Helpers
// ─────────────────────────────────────────────────────────────
export const MONTHS = [
  { index: 0, name: "January", short: "Jan", days: 31 },
  { index: 1, name: "February", short: "Feb", days: 28 }, // leap check
  { index: 2, name: "March", short: "Mar", days: 31 },
  { index: 3, name: "April", short: "Apr", days: 30 },
  { index: 4, name: "May", short: "May", days: 31 },
  { index: 5, name: "June", short: "Jun", days: 30 },
  { index: 6, name: "July", short: "Jul", days: 31 },
  { index: 7, name: "August", short: "Aug", days: 31 },
  { index: 8, name: "September", short: "Sep", days: 30 },
  { index: 9, name: "October", short: "Oct", days: 31 },
  { index: 10, name: "November", short: "Nov", days: 30 },
  { index: 11, name: "December", short: "Dec", days: 31 },
];

export const DAYS_OF_WEEK = {
  sunday: [
    { id: 0, full: "Sunday", short: "Sun", letter: "S", isWeekend: true },
    { id: 1, full: "Monday", short: "Mon", letter: "M", isWeekend: false },
    { id: 2, full: "Tuesday", short: "Tue", letter: "T", isWeekend: false },
    { id: 3, full: "Wednesday", short: "Wed", letter: "W", isWeekend: false },
    { id: 4, full: "Thursday", short: "Thu", letter: "T", isWeekend: false },
    { id: 5, full: "Friday", short: "Fri", letter: "F", isWeekend: false },
    { id: 6, full: "Saturday", short: "Sat", letter: "S", isWeekend: true },
  ],
  monday: [
    { id: 1, full: "Monday", short: "Mon", letter: "M", isWeekend: false },
    { id: 2, full: "Tuesday", short: "Tue", letter: "T", isWeekend: false },
    { id: 3, full: "Wednesday", short: "Wed", letter: "W", isWeekend: false },
    { id: 4, full: "Thursday", short: "Thu", letter: "T", isWeekend: false },
    { id: 5, full: "Friday", short: "Fri", letter: "F", isWeekend: false },
    { id: 6, full: "Saturday", short: "Sat", letter: "S", isWeekend: true },
    { id: 0, full: "Sunday", short: "Sun", letter: "S", isWeekend: true },
  ],
  saturday: [
    { id: 6, full: "Saturday", short: "Sat", letter: "S", isWeekend: true },
    { id: 0, full: "Sunday", short: "Sun", letter: "S", isWeekend: true },
    { id: 1, full: "Monday", short: "Mon", letter: "M", isWeekend: false },
    { id: 2, full: "Tuesday", short: "Tue", letter: "T", isWeekend: false },
    { id: 3, full: "Wednesday", short: "Wed", letter: "W", isWeekend: false },
    { id: 4, full: "Thursday", short: "Thu", letter: "T", isWeekend: false },
    { id: 5, full: "Friday", short: "Fri", letter: "F", isWeekend: false },
  ],
};

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year, monthIndex) {
  if (monthIndex === 1) {
    return isLeapYear(year) ? 29 : 28;
  }
  return MONTHS[monthIndex].days;
}

// ─────────────────────────────────────────────────────────────
// Astronomical Easter & Computus Algorithm (Meeus/Jones/Butcher)
// ─────────────────────────────────────────────────────────────
export function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

// Get Nth weekday of month (e.g. 3rd Monday in January: nth=3, weekday=1)
export function getNthWeekdayOfMonth(year, month, weekday, nth) {
  const date = new Date(year, month, 1);
  let count = 0;
  while (date.getMonth() === month) {
    if (date.getDay() === weekday) {
      count++;
      if (count === nth) return date.getDate();
    }
    date.setDate(date.getDate() + 1);
  }
  return null;
}

// Get Last weekday of month (e.g. Last Monday in May)
export function getLastWeekdayOfMonth(year, month, weekday) {
  const totalDays = getDaysInMonth(year, month);
  const date = new Date(year, month, totalDays);
  while (date.getDate() > 0) {
    if (date.getDay() === weekday) {
      return date.getDate();
    }
    date.setDate(date.getDate() - 1);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Holidays Engine
// ─────────────────────────────────────────────────────────────
export function getHolidaysForYear(year, countryCode, categoryFilter = { public: true, observance: true, religious: true }) {
  if (countryCode === "NONE") return [];
  const list = [];
  const add = (m, d, name, type = "public") => {
    if (!categoryFilter[type]) return;
    list.push({
      dateKey: `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      month: m,
      day: d,
      year,
      name,
      type, // 'public', 'observance', 'religious'
    });
  };

  const easter = getEasterDate(year);
  const addEasterOffset = (daysOffset, name, type = "religious") => {
    const d = new Date(easter);
    d.setDate(d.getDate() + daysOffset);
    if (d.getFullYear() === year) {
      add(d.getMonth(), d.getDate(), name, type);
    }
  };

  // 1. UNITED STATES
  if (countryCode === "US") {
    add(0, 1, "New Year's Day", "public");
    const mlk = getNthWeekdayOfMonth(year, 0, 1, 3); // 3rd Mon Jan
    if (mlk) add(0, mlk, "Martin Luther King Jr. Day", "public");
    add(1, 14, "Valentine's Day", "observance");
    const wash = getNthWeekdayOfMonth(year, 1, 1, 3); // 3rd Mon Feb
    if (wash) add(1, wash, "Presidents' Day", "public");
    add(2, 17, "St. Patrick's Day", "observance");
    addEasterOffset(-2, "Good Friday", "religious");
    addEasterOffset(0, "Easter Sunday", "religious");
    add(4, getNthWeekdayOfMonth(year, 4, 0, 2), "Mother's Day", "observance"); // 2nd Sun May
    const mem = getLastWeekdayOfMonth(year, 4, 1); // Last Mon May
    if (mem) add(4, mem, "Memorial Day", "public");
    add(5, 19, "Juneteenth National Independence Day", "public");
    add(5, getNthWeekdayOfMonth(year, 5, 0, 3), "Father's Day", "observance"); // 3rd Sun Jun
    add(6, 4, "Independence Day (4th of July)", "public");
    const lab = getNthWeekdayOfMonth(year, 8, 1, 1); // 1st Mon Sep
    if (lab) add(8, lab, "Labor Day", "public");
    const col = getNthWeekdayOfMonth(year, 9, 1, 2); // 2nd Mon Oct
    if (col) add(9, col, "Columbus Day / Indigenous Peoples' Day", "public");
    add(9, 31, "Halloween", "observance");
    add(10, 11, "Veterans Day", "public");
    const thx = getNthWeekdayOfMonth(year, 10, 4, 4); // 4th Thu Nov
    if (thx) {
      add(10, thx, "Thanksgiving Day", "public");
      add(10, thx + 1, "Black Friday", "observance");
    }
    add(11, 24, "Christmas Eve", "observance");
    add(11, 25, "Christmas Day", "public");
    add(11, 31, "New Year's Eve", "observance");
  }

  // 2. UNITED KINGDOM
  else if (countryCode === "GB") {
    add(0, 1, "New Year's Day", "public");
    add(2, 17, "St. Patrick's Day", "observance");
    addEasterOffset(-2, "Good Friday", "public");
    addEasterOffset(0, "Easter Sunday", "religious");
    addEasterOffset(1, "Easter Monday", "public");
    add(3, 23, "St. George's Day", "observance");
    const earlyMay = getNthWeekdayOfMonth(year, 4, 1, 1);
    if (earlyMay) add(4, earlyMay, "Early May Bank Holiday", "public");
    const springBank = getLastWeekdayOfMonth(year, 4, 1);
    if (springBank) add(4, springBank, "Spring Bank Holiday", "public");
    const summerBank = getLastWeekdayOfMonth(year, 7, 1);
    if (summerBank) add(7, summerBank, "Summer Bank Holiday", "public");
    add(9, 31, "Halloween", "observance");
    add(10, 5, "Guy Fawkes Night", "observance");
    add(10, 11, "Remembrance Day", "observance");
    add(11, 25, "Christmas Day", "public");
    add(11, 26, "Boxing Day", "public");
    add(11, 31, "New Year's Eve", "observance");
  }

  // 3. CANADA
  else if (countryCode === "CA") {
    add(0, 1, "New Year's Day", "public");
    const fam = getNthWeekdayOfMonth(year, 1, 1, 3);
    if (fam) add(1, fam, "Family Day", "public");
    addEasterOffset(-2, "Good Friday", "public");
    addEasterOffset(1, "Easter Monday", "observance");
    // Victoria Day: Monday preceding May 25
    const vic = new Date(year, 4, 25);
    while (vic.getDay() !== 1) vic.setDate(vic.getDate() - 1);
    add(4, vic.getDate(), "Victoria Day", "public");
    add(6, 1, "Canada Day", "public");
    const civic = getNthWeekdayOfMonth(year, 7, 1, 1);
    if (civic) add(7, civic, "Civic Holiday", "public");
    const lab = getNthWeekdayOfMonth(year, 8, 1, 1);
    if (lab) add(8, lab, "Labour Day", "public");
    add(8, 30, "National Day for Truth and Reconciliation", "public");
    const thx = getNthWeekdayOfMonth(year, 9, 1, 2); // 2nd Mon Oct
    if (thx) add(9, thx, "Thanksgiving Day", "public");
    add(10, 11, "Remembrance Day", "public");
    add(11, 25, "Christmas Day", "public");
    add(11, 26, "Boxing Day", "public");
  }

  // 4. AUSTRALIA
  else if (countryCode === "AU") {
    add(0, 1, "New Year's Day", "public");
    add(0, 26, "Australia Day", "public");
    addEasterOffset(-2, "Good Friday", "public");
    addEasterOffset(0, "Easter Sunday", "public");
    addEasterOffset(1, "Easter Monday", "public");
    add(3, 25, "ANZAC Day", "public");
    const kingB = getNthWeekdayOfMonth(year, 5, 1, 2);
    if (kingB) add(5, kingB, "King's Birthday", "public");
    const lab = getNthWeekdayOfMonth(year, 9, 1, 1);
    if (lab) add(9, lab, "Labour Day (NSW/ACT/SA)", "public");
    add(11, 25, "Christmas Day", "public");
    add(11, 26, "Boxing Day", "public");
  }

  // 5. GERMANY
  else if (countryCode === "DE") {
    add(0, 1, "Neujahr", "public");
    add(0, 6, "Heilige Drei Könige", "religious");
    addEasterOffset(-2, "Karfreitag", "public");
    addEasterOffset(0, "Ostersonntag", "religious");
    addEasterOffset(1, "Ostermontag", "public");
    add(4, 1, "Tag der Arbeit", "public");
    addEasterOffset(39, "Christi Himmelfahrt (Vatertag)", "public");
    addEasterOffset(50, "Pfingstmontag", "public");
    addEasterOffset(60, "Fronleichnam", "religious");
    add(9, 3, "Tag der Deutschen Einheit", "public");
    add(9, 31, "Reformationstag", "religious");
    add(10, 1, "Allerheiligen", "religious");
    add(11, 25, "1. Weihnachtstag", "public");
    add(11, 26, "2. Weihnachtstag", "public");
    add(11, 31, "Silvester", "observance");
  }

  // 6. FRANCE
  else if (countryCode === "FR") {
    add(0, 1, "Jour de l'An", "public");
    addEasterOffset(1, "Lundi de Pâques", "public");
    add(4, 1, "Fête du Travail", "public");
    add(4, 8, "Victoire 1945", "public");
    addEasterOffset(39, "Ascension", "public");
    addEasterOffset(50, "Lundi de Pentecôte", "public");
    add(6, 14, "Fête Nationale (Bastille Day)", "public");
    add(7, 15, "Assomption", "religious");
    add(10, 1, "Toussaint", "religious");
    add(10, 11, "Armistice 1918", "public");
    add(11, 25, "Noël", "public");
  }

  // 7. INDIA
  else if (countryCode === "IN") {
    add(0, 26, "Republic Day", "public");
    add(2, 8, "Maha Shivratri", "religious");
    add(2, 25, "Holi Festival", "religious");
    addEasterOffset(-2, "Good Friday", "religious");
    add(3, 14, "Dr. Ambedkar Jayanti", "observance");
    add(4, 1, "May Day", "observance");
    add(7, 15, "Independence Day", "public");
    add(7, 19, "Raksha Bandhan", "religious");
    add(7, 26, "Janmashtami", "religious");
    add(8, 7, "Ganesh Chaturthi", "religious");
    add(9, 2, "Gandhi Jayanti", "public");
    add(9, 12, "Dussehra", "religious");
    add(10, 1, "Diwali (Deepavali)", "religious");
    add(10, 15, "Guru Nanak Jayanti", "religious");
    add(11, 25, "Christmas Day", "public");
  }

  // 8. BANGLADESH
  else if (countryCode === "BD") {
    add(1, 21, "International Mother Language Day (Shaheed Day)", "public");
    add(2, 17, "Sheikh Mujibur Rahman Birthday", "observance");
    add(2, 26, "Independence & National Day", "public");
    add(3, 14, "Pohela Boishakh (Bengali New Year)", "public");
    add(4, 1, "May Day", "public");
    add(4, 23, "Buddha Purnima", "religious");
    add(7, 15, "National Mourning Day", "observance");
    add(8, 16, "Janmashtami", "religious");
    add(9, 12, "Durga Puja (Bijoya Dashami)", "religious");
    add(11, 16, "Victory Day (Bijoy Dibos)", "public");
    add(11, 25, "Christmas Day", "public");
  }

  // 9. JAPAN
  else if (countryCode === "JP") {
    add(0, 1, "Gantan (New Year's Day)", "public");
    const adult = getNthWeekdayOfMonth(year, 0, 1, 2);
    if (adult) add(0, adult, "Seijin no Hi (Coming of Age)", "public");
    add(1, 11, "Kenkoku Kinen no Hi (National Foundation)", "public");
    add(1, 23, "Tennō Tanjōbi (Emperor's Birthday)", "public");
    add(2, 20, "Shunbun no Hi (Vernal Equinox)", "public");
    add(3, 29, "Shōwa no Hi (Showa Day)", "public");
    add(4, 3, "Kenpō Kinenbi (Constitution Memorial)", "public");
    add(4, 4, "Midori no Hi (Greenery Day)", "public");
    add(4, 5, "Kodomo no Hi (Children's Day)", "public");
    const marine = getNthWeekdayOfMonth(year, 6, 1, 3);
    if (marine) add(6, marine, "Umi no Hi (Marine Day)", "public");
    add(7, 11, "Yama no Hi (Mountain Day)", "public");
    const respect = getNthWeekdayOfMonth(year, 8, 1, 3);
    if (respect) add(8, respect, "Keirō no Hi (Respect for the Aged)", "public");
    add(8, 22, "Shūbun no Hi (Autumnal Equinox)", "public");
    const sports = getNthWeekdayOfMonth(year, 9, 1, 2);
    if (sports) add(9, sports, "Sports no Hi", "public");
    add(10, 3, "Bunka no Hi (Culture Day)", "public");
    add(10, 23, "Kinrō Kansha no Hi (Labor Thanksgiving)", "public");
  }

  // 10. BRAZIL
  else if (countryCode === "BR") {
    add(0, 1, "Confraternização Universal", "public");
    addEasterOffset(-47, "Carnaval", "observance");
    addEasterOffset(-2, "Sexta-feira Santa", "public");
    addEasterOffset(0, "Páscoa", "religious");
    add(3, 21, "Tiradentes", "public");
    add(4, 1, "Dia do Trabalhador", "public");
    addEasterOffset(60, "Corpus Christi", "religious");
    add(8, 7, "Independência do Brasil", "public");
    add(9, 12, "Nossa Senhora Aparecida", "religious");
    add(10, 2, "Finados", "religious");
    add(10, 15, "Proclamação da República", "public");
    add(10, 20, "Dia da Consciência Negra", "public");
    add(11, 25, "Natal", "public");
  }

  // 11. GLOBAL / UN OBSERVANCES
  if (countryCode === "GLOBAL" || countryCode === "US" || countryCode === "GB") {
    if (countryCode === "GLOBAL") {
      add(0, 1, "New Year's Day", "public");
      add(1, 14, "Valentine's Day", "observance");
      add(2, 8, "International Women's Day", "observance");
      add(2, 21, "World Poetry Day", "observance");
      add(3, 22, "Earth Day", "observance");
      add(4, 1, "International Workers' Day", "public");
      add(5, 5, "World Environment Day", "observance");
      add(5, 21, "International Yoga Day", "observance");
      add(8, 21, "International Day of Peace", "observance");
      add(9, 31, "Halloween", "observance");
      add(11, 10, "Human Rights Day", "observance");
      add(11, 25, "Christmas Day", "religious");
      add(11, 31, "New Year's Eve", "observance");
    }
  }

  return list.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
}

// ─────────────────────────────────────────────────────────────
// Accurate Moon Phase Calculator (Synodic Lunar Month)
// ─────────────────────────────────────────────────────────────
export function getMoonPhaseForDate(year, month, day) {
  // Known reference new moon: Jan 11, 2024 at 11:57 UTC
  const refMs = Date.UTC(2024, 0, 11, 11, 57, 0);
  const targetMs = Date.UTC(year, month, day, 12, 0, 0);
  const diffDays = (targetMs - refMs) / (1000 * 60 * 60 * 24);
  const SYNODIC_MONTH = 29.53058867;
  const phaseDays = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // Windows of ~0.85 days around peak
  if (phaseDays < 0.85 || phaseDays > SYNODIC_MONTH - 0.85) {
    return { type: "new", name: "New Moon", icon: "🌑", symbol: "●" };
  }
  if (Math.abs(phaseDays - 7.38) <= 0.85) {
    return { type: "firstQuarter", name: "First Quarter", icon: "🌓", symbol: "◑" };
  }
  if (Math.abs(phaseDays - 14.76) <= 0.85) {
    return { type: "full", name: "Full Moon", icon: "🌕", symbol: "○" };
  }
  if (Math.abs(phaseDays - 22.15) <= 0.85) {
    return { type: "lastQuarter", name: "Last Quarter", icon: "🌗", symbol: "◐" };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// ISO 8601 Week Number
// ─────────────────────────────────────────────────────────────
export function getISOWeek(year, month, day) {
  const d = new Date(Date.UTC(year, month, day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// ─────────────────────────────────────────────────────────────
// Day of Year (1 - 365/366)
// ─────────────────────────────────────────────────────────────
export function getDayOfYear(year, month, day) {
  const now = new Date(Date.UTC(year, month, day));
  const start = new Date(Date.UTC(year, 0, 0));
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// ─────────────────────────────────────────────────────────────
// Month Calendar Builder
// ─────────────────────────────────────────────────────────────
export function buildMonthMatrix({
  year,
  monthIndex,
  firstDayOfWeek = "sunday", // 'sunday' | 'monday' | 'saturday'
  showTrailingDays = true,
  holidaysMap = {},
  customEventsMap = {},
  showMoonPhases = false,
  showDayOfYear = false,
}) {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDayObj = new Date(year, monthIndex, 1);
  const firstDayDow = firstDayObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  // Map to column offset according to selected first day
  let offset = 0;
  if (firstDayOfWeek === "sunday") {
    offset = firstDayDow; // Sun=0, Mon=1...
  } else if (firstDayOfWeek === "monday") {
    offset = (firstDayDow + 6) % 7; // Mon=0, Tue=1... Sun=6
  } else if (firstDayOfWeek === "saturday") {
    offset = (firstDayDow + 1) % 7; // Sat=0, Sun=1... Fri=6
  }

  // Previous month trailing
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonthIndex);

  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;

  const weeks = [];
  let currentWeek = [];

  // Trailing days from previous month
  for (let i = offset - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const dateKey = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    currentWeek.push({
      day: dayNum,
      month: prevMonthIndex,
      year: prevYear,
      isCurrentMonth: false,
      dateKey,
      holiday: showTrailingDays ? holidaysMap[dateKey] : null,
      customEvent: showTrailingDays ? customEventsMap[dateKey] : null,
      moonPhase: showTrailingDays && showMoonPhases ? getMoonPhaseForDate(prevYear, prevMonthIndex, dayNum) : null,
      dayOfYear: null,
      isWeekend: false,
    });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = new Date(year, monthIndex, day);
    const dow = dateObj.getDay();
    const isWeekend = dow === 0 || dow === 6; // Sunday or Saturday

    currentWeek.push({
      day,
      month: monthIndex,
      year,
      isCurrentMonth: true,
      dateKey,
      holiday: holidaysMap[dateKey] || null,
      customEvent: customEventsMap[dateKey] || null,
      moonPhase: showMoonPhases ? getMoonPhaseForDate(year, monthIndex, day) : null,
      dayOfYear: showDayOfYear ? getDayOfYear(year, monthIndex, day) : null,
      isWeekend,
    });

    if (currentWeek.length === 7) {
      // Calculate week number based on 4th day of that week
      const midDay = currentWeek[3];
      const weekNumber = getISOWeek(midDay.year, midDay.month, midDay.day);
      weeks.push({ weekNumber, days: currentWeek });
      currentWeek = [];
    }
  }

  // Next month leading days to complete the last row
  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      const dateKey = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
      currentWeek.push({
        day: nextDay,
        month: nextMonthIndex,
        year: nextYear,
        isCurrentMonth: false,
        dateKey,
        holiday: showTrailingDays ? holidaysMap[dateKey] : null,
        customEvent: showTrailingDays ? customEventsMap[dateKey] : null,
        moonPhase: showTrailingDays && showMoonPhases ? getMoonPhaseForDate(nextYear, nextMonthIndex, nextDay) : null,
        dayOfYear: null,
        isWeekend: false,
      });
      nextDay++;
    }
    const midDay = currentWeek[3];
    const weekNumber = getISOWeek(midDay.year, midDay.month, midDay.day);
    weeks.push({ weekNumber, days: currentWeek });
  }

  // Optional: keep 6 rows standard height across all months for crisp uniform grid
  while (weeks.length < 6) {
    const dummyDays = [];
    let startDay = weeks[weeks.length - 1].days[6].day + 1;
    for (let i = 0; i < 7; i++) {
      const dateKey = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, "0")}-${String(startDay + i).padStart(2, "0")}`;
      dummyDays.push({
        day: startDay + i,
        month: nextMonthIndex,
        year: nextYear,
        isCurrentMonth: false,
        dateKey,
        holiday: null,
        customEvent: null,
        moonPhase: null,
        dayOfYear: null,
        isWeekend: false,
      });
    }
    const midDay = dummyDays[3];
    weeks.push({ weekNumber: getISOWeek(midDay.year, midDay.month, midDay.day), days: dummyDays });
  }

  return weeks;
}

// ─────────────────────────────────────────────────────────────
// Ready-Made Presets
// ─────────────────────────────────────────────────────────────
export const CALENDAR_PRESETS = [
  {
    id: "classicWall",
    name: "Classic 2027 Wall Calendar",
    icon: "Calendar",
    description: "Standard full year 2027 in 4×3 Landscape on A4 paper with US holidays",
    settings: {
      year: 2027,
      periodMode: "year",
      pageSize: "a4",
      orientation: "landscape",
      columns: 4,
      firstDayOfWeek: "sunday",
      theme: "nordicSlate",
      country: "US",
      showWeekNumbers: false,
      showMoonPhases: false,
      showHolidaysLegend: true,
      title: "2027 Calendar",
      subtitle: "United States Federal Holidays & Observances",
    },
  },
  {
    id: "minimalExecutive",
    name: "Executive Minimalist",
    icon: "Briefcase",
    description: "Ultra clean monochrome Swiss typography on Letter paper with ISO week numbers",
    settings: {
      year: 2027,
      periodMode: "year",
      pageSize: "letter",
      orientation: "portrait",
      columns: 3,
      firstDayOfWeek: "monday",
      theme: "swissMinimal",
      country: "US",
      showWeekNumbers: true,
      showMoonPhases: false,
      showHolidaysLegend: true,
      title: "Annual Schedule 2027",
      subtitle: "Executive Planning & Operations",
    },
  },
  {
    id: "academicYear",
    name: "Academic Year (Jul 2026 – Jun 2027)",
    icon: "GraduationCap",
    description: "12-month school & university calendar starting July with study notes box",
    settings: {
      year: 2026,
      periodMode: "customRange",
      startMonth: 6, // July 2026
      endMonth: 5,   // June 2027
      endYear: 2027,
      pageSize: "a4",
      orientation: "landscape",
      columns: 4,
      firstDayOfWeek: "monday",
      theme: "royalIndigo",
      country: "US",
      showWeekNumbers: true,
      showMoonPhases: false,
      showNotes: true,
      notesType: "lines",
      title: "Academic Year 2026 – 2027",
      subtitle: "Courses, Assignments & Term Schedule",
    },
  },
  {
    id: "singleMonthDesk",
    name: "Large Monthly Desk Poster",
    icon: "Maximize2",
    description: "Spacious single month format with roomy day cells for writing events & moon phases",
    settings: {
      year: 2027,
      periodMode: "singleMonth",
      singleMonth: 0, // January
      pageSize: "a4",
      orientation: "landscape",
      columns: 1,
      firstDayOfWeek: "sunday",
      theme: "emeraldSage",
      country: "US",
      showWeekNumbers: true,
      showMoonPhases: true,
      showNotes: true,
      notesType: "checkboxes",
      title: "January 2027",
      subtitle: "Monthly Goals & Action Items",
    },
  },
  {
    id: "darkWallpaper",
    name: "16:9 Dark Mode Wallpaper",
    icon: "Monitor",
    description: "Sleek Obsidian dark 1920×1080 desktop background calendar with vibrant accents",
    settings: {
      year: 2027,
      periodMode: "year",
      pageSize: "wallpaper",
      orientation: "landscape",
      columns: 6,
      firstDayOfWeek: "monday",
      theme: "cyberDark",
      country: "GLOBAL",
      showWeekNumbers: false,
      showMoonPhases: true,
      showHolidaysLegend: false,
      title: "2027 MASTER CALENDAR",
      subtitle: "Focus • Consistency • Momentum",
    },
  },
  {
    id: "inkSaverPrint",
    name: "Ink-Saving Home Print",
    icon: "Printer",
    description: "Zero ink waste, high-contrast borders for laser and inkjet printers",
    settings: {
      year: 2027,
      periodMode: "year",
      pageSize: "letter",
      orientation: "portrait",
      columns: 3,
      firstDayOfWeek: "sunday",
      theme: "inkSaver",
      country: "US",
      showWeekNumbers: false,
      showMoonPhases: false,
      showHolidaysLegend: true,
      title: "2027 Calendar",
      subtitle: "Printable Reference",
    },
  },
];

// ─────────────────────────────────────────────────────────────
// iCalendar (.ics) Generator
// ─────────────────────────────────────────────────────────────
export function generateICS(events, calendarTitle = "Custom Calendar") {
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//ToolsTrek//${calendarTitle}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarTitle}`,
  ];

  events.forEach((ev, idx) => {
    const y = ev.year;
    const m = String(ev.month + 1).padStart(2, "0");
    const d = String(ev.day).padStart(2, "0");
    const dt = `${y}${m}${d}`;
    ics.push(
      "BEGIN:VEVENT",
      `UID:toolstrek-${y}-${m}-${d}-${idx}@toolstrek.vercel.app`,
      `DTSTAMP:${y}0101T000000Z`,
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dt}`,
      `SUMMARY:${ev.name || ev.title}`,
      `DESCRIPTION:${ev.type ? `Category: ${ev.type}` : "Custom Event"}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}
