// app/(main)/tools-compo/tools/flight-duration-calculator/flightDurationData.js
// Static airport catalogue, pure date/time helpers, and the calculation engine
// behind the Flight Duration Calculator. Keeping the maths separate from the
// UI makes every result reproducible and easy to test.

export const MODES = {
  DURATION: "duration",
  ARRIVAL: "arrival",
  DEPARTURE: "departure",
};

export const MODE_META = {
  [MODES.DURATION]: {
    label: "Flight duration",
    shortLabel: "Duration",
    description:
      "Know your departure and arrival times? We'll work out the flight time, layovers and full journey.",
  },
  [MODES.ARRIVAL]: {
    label: "Arrival time",
    shortLabel: "Arrival",
    description:
      "Know when you leave and how long you're flying? We'll find your local arrival time at the destination.",
  },
  [MODES.DEPARTURE]: {
    label: "Departure time",
    shortLabel: "Departure",
    description:
      "Know when you must land and the flight time? We'll work backwards to your local departure time.",
  },
};

export const DEFAULT_SETTINGS = {
  timeFormat: "24h",
  units: "km",
  preBufferMinutes: 120,
  postBufferMinutes: 45,
  minDomesticConnection: 45,
  minInternationalConnection: 90,
  includeBuffersInHeadline: true,
  showDistance: true,
  showTimeline: true,
  showTechnicalDetails: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Airport catalogue
// [code, airport name, city, country, IANA time zone, latitude, longitude]
// Coordinates are used for great-circle distance and average speed estimates.
// ─────────────────────────────────────────────────────────────────────────────
const AIRPORT_ROWS = [
  ["DAC", "Hazrat Shahjalal International", "Dhaka", "Bangladesh", "Asia/Dhaka", 23.8103, 90.4125],
  ["CGP", "Shah Amanat International", "Chattogram", "Bangladesh", "Asia/Dhaka", 22.2496, 91.8133],
  ["CXB", "Cox's Bazar", "Cox's Bazar", "Bangladesh", "Asia/Dhaka", 21.4522, 91.9639],
  ["ZYL", "Osmani International", "Sylhet", "Bangladesh", "Asia/Dhaka", 24.9632, 91.8668],
  ["DEL", "Indira Gandhi International", "Delhi", "India", "Asia/Kolkata", 28.5562, 77.1],
  ["BOM", "Chhatrapati Shivaji Maharaj International", "Mumbai", "India", "Asia/Kolkata", 19.0896, 72.8656],
  ["BLR", "Kempegowda International", "Bengaluru", "India", "Asia/Kolkata", 13.1986, 77.7066],
  ["MAA", "Chennai International", "Chennai", "India", "Asia/Kolkata", 12.9941, 80.1709],
  ["CCU", "Netaji Subhas Chandra Bose International", "Kolkata", "India", "Asia/Kolkata", 22.6547, 88.4467],
  ["HYD", "Rajiv Gandhi International", "Hyderabad", "India", "Asia/Kolkata", 17.2403, 78.4294],
  ["COK", "Cochin International", "Kochi", "India", "Asia/Kolkata", 10.152, 76.4019],
  ["AMD", "Sardar Vallabhbhai Patel International", "Ahmedabad", "India", "Asia/Kolkata", 23.0713, 72.6347],
  ["GOI", "Manohar International", "Goa", "India", "Asia/Kolkata", 15.3808, 73.8314],
  ["KTM", "Tribhuvan International", "Kathmandu", "Nepal", "Asia/Kathmandu", 27.7172, 85.324],
  ["CMB", "Bandaranaike International", "Colombo", "Sri Lanka", "Asia/Colombo", 7.1808, 79.8841],
  ["MLE", "Velana International", "Malé", "Maldives", "Indian/Maldives", 4.1918, 73.5291],
  ["KHI", "Jinnah International", "Karachi", "Pakistan", "Asia/Karachi", 24.9065, 67.1608],
  ["LHE", "Allama Iqbal International", "Lahore", "Pakistan", "Asia/Karachi", 31.5216, 74.4036],
  ["PBH", "Paro International", "Paro", "Bhutan", "Asia/Thimphu", 27.4032, 89.4262],
  ["DXB", "Dubai International", "Dubai", "United Arab Emirates", "Asia/Dubai", 25.2532, 55.3657],
  ["AUH", "Zayed International", "Abu Dhabi", "United Arab Emirates", "Asia/Dubai", 24.433, 54.6511],
  ["DOH", "Hamad International", "Doha", "Qatar", "Asia/Qatar", 25.2731, 51.6081],
  ["RUH", "King Khalid International", "Riyadh", "Saudi Arabia", "Asia/Riyadh", 24.9576, 46.6988],
  ["JED", "King Abdulaziz International", "Jeddah", "Saudi Arabia", "Asia/Riyadh", 21.6796, 39.1565],
  ["KWI", "Kuwait International", "Kuwait City", "Kuwait", "Asia/Kuwait", 29.2266, 47.9689],
  ["BAH", "Bahrain International", "Manama", "Bahrain", "Asia/Bahrain", 26.2708, 50.6336],
  ["MCT", "Muscat International", "Muscat", "Oman", "Asia/Muscat", 23.5933, 58.2844],
  ["IST", "Istanbul Airport", "Istanbul", "Türkiye", "Europe/Istanbul", 41.2753, 28.7519],
  ["TLV", "Ben Gurion", "Tel Aviv", "Israel", "Asia/Jerusalem", 32.0055, 34.8854],
  ["AMM", "Queen Alia International", "Amman", "Jordan", "Asia/Amman", 31.7226, 35.9932],
  ["BEY", "Beirut–Rafic Hariri International", "Beirut", "Lebanon", "Asia/Beirut", 33.8209, 35.4884],
  ["BKK", "Suvarnabhumi", "Bangkok", "Thailand", "Asia/Bangkok", 13.69, 100.7501],
  ["SIN", "Changi", "Singapore", "Singapore", "Asia/Singapore", 1.3644, 103.9915],
  ["KUL", "Kuala Lumpur International", "Kuala Lumpur", "Malaysia", "Asia/Kuala_Lumpur", 2.7456, 101.7099],
  ["CGK", "Soekarno–Hatta International", "Jakarta", "Indonesia", "Asia/Jakarta", -6.1256, 106.6559],
  ["MNL", "Ninoy Aquino International", "Manila", "Philippines", "Asia/Manila", 14.5086, 121.0194],
  ["HAN", "Noi Bai International", "Hanoi", "Vietnam", "Asia/Ho_Chi_Minh", 21.2187, 105.8042],
  ["SGN", "Tan Son Nhat International", "Ho Chi Minh City", "Vietnam", "Asia/Ho_Chi_Minh", 10.8188, 106.652],
  ["DPS", "I Gusti Ngurah Rai International", "Bali", "Indonesia", "Asia/Makassar", -8.7482, 115.1672],
  ["PNH", "Techo International", "Phnom Penh", "Cambodia", "Asia/Phnom_Penh", 11.5466, 104.8441],
  ["RGN", "Yangon International", "Yangon", "Myanmar", "Asia/Yangon", 16.9073, 96.1332],
  ["HKG", "Hong Kong International", "Hong Kong", "Hong Kong", "Asia/Hong_Kong", 22.308, 113.9185],
  ["TPE", "Taoyuan International", "Taipei", "Taiwan", "Asia/Taipei", 25.0777, 121.2328],
  ["PVG", "Pudong International", "Shanghai", "China", "Asia/Shanghai", 31.1443, 121.8083],
  ["PEK", "Beijing Capital International", "Beijing", "China", "Asia/Shanghai", 40.0799, 116.6031],
  ["CAN", "Baiyun International", "Guangzhou", "China", "Asia/Shanghai", 23.3924, 113.2988],
  ["NRT", "Narita International", "Tokyo", "Japan", "Asia/Tokyo", 35.772, 140.3929],
  ["HND", "Haneda", "Tokyo", "Japan", "Asia/Tokyo", 35.5494, 139.7798],
  ["KIX", "Kansai International", "Osaka", "Japan", "Asia/Tokyo", 34.4347, 135.2441],
  ["ICN", "Incheon International", "Seoul", "South Korea", "Asia/Seoul", 37.4602, 126.4407],
  ["CTS", "New Chitose", "Sapporo", "Japan", "Asia/Tokyo", 42.7752, 141.6923],
  ["LHR", "Heathrow", "London", "United Kingdom", "Europe/London", 51.47, -0.4543],
  ["LGW", "Gatwick", "London", "United Kingdom", "Europe/London", 51.1537, -0.1821],
  ["CDG", "Charles de Gaulle", "Paris", "France", "Europe/Paris", 49.0097, 2.5479],
  ["AMS", "Schiphol", "Amsterdam", "Netherlands", "Europe/Amsterdam", 52.3105, 4.7683],
  ["FRA", "Frankfurt Airport", "Frankfurt", "Germany", "Europe/Berlin", 50.0379, 8.5622],
  ["MUC", "Munich Airport", "Munich", "Germany", "Europe/Berlin", 48.3538, 11.7861],
  ["MAD", "Adolfo Suárez Madrid–Barajas", "Madrid", "Spain", "Europe/Madrid", 40.4983, -3.5676],
  ["BCN", "Josep Tarradellas Barcelona–El Prat", "Barcelona", "Spain", "Europe/Madrid", 41.2974, 2.0833],
  ["FCO", "Leonardo da Vinci–Fiumicino", "Rome", "Italy", "Europe/Rome", 41.8003, 12.2389],
  ["MXP", "Milan Malpensa", "Milan", "Italy", "Europe/Rome", 45.6306, 8.7281],
  ["ZRH", "Zurich Airport", "Zurich", "Switzerland", "Europe/Zurich", 47.4582, 8.5555],
  ["VIE", "Vienna International", "Vienna", "Austria", "Europe/Vienna", 48.1103, 16.5697],
  ["BRU", "Brussels Airport", "Brussels", "Belgium", "Europe/Brussels", 50.901, 4.4844],
  ["CPH", "Copenhagen Airport", "Copenhagen", "Denmark", "Europe/Copenhagen", 55.618, 12.6508],
  ["ARN", "Stockholm Arlanda", "Stockholm", "Sweden", "Europe/Stockholm", 59.6519, 17.9186],
  ["OSL", "Oslo Gardermoen", "Oslo", "Norway", "Europe/Oslo", 60.1976, 11.1004],
  ["HEL", "Helsinki-Vantaa", "Helsinki", "Finland", "Europe/Helsinki", 60.3172, 24.9633],
  ["DUB", "Dublin Airport", "Dublin", "Ireland", "Europe/Dublin", 53.4213, -6.2701],
  ["LIS", "Humberto Delgado", "Lisbon", "Portugal", "Europe/Lisbon", 38.7742, -9.1342],
  ["ATH", "Athens International", "Athens", "Greece", "Europe/Athens", 37.9364, 23.9445],
  ["PRG", "Václav Havel Prague", "Prague", "Czechia", "Europe/Prague", 50.1008, 14.26],
  ["WAW", "Warsaw Chopin", "Warsaw", "Poland", "Europe/Warsaw", 52.1657, 20.9671],
  ["BUD", "Budapest Ferenc Liszt", "Budapest", "Hungary", "Europe/Budapest", 47.4369, 19.2556],
  ["JFK", "John F. Kennedy International", "New York", "United States", "America/New_York", 40.6413, -73.7781],
  ["EWR", "Newark Liberty International", "New York", "United States", "America/New_York", 40.6895, -74.1745],
  ["LGA", "LaGuardia", "New York", "United States", "America/New_York", 40.7769, -73.874],
  ["LAX", "Los Angeles International", "Los Angeles", "United States", "America/Los_Angeles", 33.9416, -118.4085],
  ["SFO", "San Francisco International", "San Francisco", "United States", "America/Los_Angeles", 37.6213, -122.379],
  ["ORD", "O'Hare International", "Chicago", "United States", "America/Chicago", 41.9742, -87.9073],
  ["DFW", "Dallas/Fort Worth International", "Dallas", "United States", "America/Chicago", 32.8998, -97.0403],
  ["ATL", "Hartsfield–Jackson Atlanta International", "Atlanta", "United States", "America/New_York", 33.6407, -84.4277],
  ["MIA", "Miami International", "Miami", "United States", "America/New_York", 25.7959, -80.287],
  ["SEA", "Seattle–Tacoma International", "Seattle", "United States", "America/Los_Angeles", 47.4502, -122.3088],
  ["BOS", "Boston Logan International", "Boston", "United States", "America/New_York", 42.3656, -71.0096],
  ["IAD", "Washington Dulles International", "Washington", "United States", "America/New_York", 38.9531, -77.4565],
  ["YYZ", "Toronto Pearson International", "Toronto", "Canada", "America/Toronto", 43.6777, -79.6248],
  ["YVR", "Vancouver International", "Vancouver", "Canada", "America/Vancouver", 49.1967, -123.1815],
  ["MEX", "Mexico City International", "Mexico City", "Mexico", "America/Mexico_City", 19.4361, -99.0719],
  ["CUN", "Cancún International", "Cancún", "Mexico", "America/Cancun", 21.0365, -86.8771],
  ["GRU", "São Paulo/Guarulhos International", "São Paulo", "Brazil", "America/Sao_Paulo", -23.4356, -46.4731],
  ["GIG", "Rio de Janeiro/Galeão International", "Rio de Janeiro", "Brazil", "America/Sao_Paulo", -22.809, -43.2506],
  ["EZE", "Ministro Pistarini International", "Buenos Aires", "Argentina", "America/Argentina/Buenos_Aires", -34.8222, -58.5358],
  ["SCL", "Arturo Merino Benítez International", "Santiago", "Chile", "America/Santiago", -33.393, -70.7858],
  ["BOG", "El Dorado International", "Bogotá", "Colombia", "America/Bogota", 4.7016, -74.1469],
  ["LIM", "Jorge Chávez International", "Lima", "Peru", "America/Lima", -12.0219, -77.1143],
  ["CAI", "Cairo International", "Cairo", "Egypt", "Africa/Cairo", 30.1219, 31.4056],
  ["JNB", "O. R. Tambo International", "Johannesburg", "South Africa", "Africa/Johannesburg", -26.1367, 28.2411],
  ["CPT", "Cape Town International", "Cape Town", "South Africa", "Africa/Johannesburg", -33.9715, 18.6021],
  ["NBO", "Jomo Kenyatta International", "Nairobi", "Kenya", "Africa/Nairobi", -1.3192, 36.9278],
  ["ADD", "Addis Ababa Bole International", "Addis Ababa", "Ethiopia", "Africa/Addis_Ababa", 8.9779, 38.7993],
  ["LOS", "Murtala Muhammed International", "Lagos", "Nigeria", "Africa/Lagos", 6.5774, 3.3212],
  ["CMN", "Mohammed V International", "Casablanca", "Morocco", "Africa/Casablanca", 33.3675, -7.5898],
  ["DAR", "Julius Nyerere International", "Dar es Salaam", "Tanzania", "Africa/Dar_es_Salaam", -6.8781, 39.2026],
  ["SYD", "Sydney Kingsford Smith", "Sydney", "Australia", "Australia/Sydney", -33.9399, 151.1753],
  ["MEL", "Melbourne Airport", "Melbourne", "Australia", "Australia/Melbourne", -37.669, 144.841],
  ["BNE", "Brisbane Airport", "Brisbane", "Australia", "Australia/Brisbane", -27.3842, 153.1175],
  ["PER", "Perth Airport", "Perth", "Australia", "Australia/Perth", -31.9403, 115.9669],
  ["AKL", "Auckland Airport", "Auckland", "New Zealand", "Pacific/Auckland", -37.0082, 174.785],
  ["NAN", "Nadi International", "Nadi", "Fiji", "Pacific/Fiji", -17.7554, 177.4434],
  ["SVO", "Sheremetyevo International", "Moscow", "Russia", "Europe/Moscow", 55.9726, 37.4146],
  ["DME", "Domodedovo International", "Moscow", "Russia", "Europe/Moscow", 55.4088, 37.9063],
  ["ALA", "Almaty International", "Almaty", "Kazakhstan", "Asia/Almaty", 43.3521, 77.0405],
  ["TAS", "Tashkent International", "Tashkent", "Uzbekistan", "Asia/Tashkent", 41.2579, 69.2812],
];

export const AIRPORTS = AIRPORT_ROWS.map(
  ([code, name, city, country, timezone, lat, lon]) => ({
    code,
    name,
    city,
    country,
    timezone,
    lat,
    lon,
  }),
).sort((a, b) => a.city.localeCompare(b.city) || a.code.localeCompare(b.code));

export const AIRPORT_MAP = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

export const CUSTOM_AIRPORT_CODE = "__custom__";

export const TIME_ZONES = (() => {
  const fallback = [
    "UTC",
    "Asia/Dhaka",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Europe/London",
    "Europe/Paris",
    "America/New_York",
    "America/Los_Angeles",
    "Australia/Sydney",
  ];
  try {
    const supported = Intl.supportedValuesOf("timeZone");
    if (Array.isArray(supported) && supported.length > 0) {
      return ["UTC", ...supported.filter((zone) => zone !== "UTC")];
    }
  } catch {
    // Older browsers fall back to the major zones used by the airport list.
  }
  return fallback;
})();

// ─────────────────────────────────────────────────────────────────────────────
// Constants & small utilities
// ─────────────────────────────────────────────────────────────────────────────
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export const MAX_SEGMENTS = 6;
export const MIN_FLIGHT_MINUTES = 10;
export const MAX_FLIGHT_MINUTES = 72 * 60;

const pad2 = (value) => String(value).padStart(2, "0");

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function normalizeSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  return {
    ...merged,
    timeFormat: merged.timeFormat === "12h" ? "12h" : "24h",
    units: merged.units === "mi" ? "mi" : "km",
    preBufferMinutes: Math.round(clampNumber(merged.preBufferMinutes, 0, 360, 120)),
    postBufferMinutes: Math.round(clampNumber(merged.postBufferMinutes, 0, 240, 45)),
    minDomesticConnection: Math.round(clampNumber(merged.minDomesticConnection, 20, 180, 45)),
    minInternationalConnection: Math.round(
      clampNumber(merged.minInternationalConnection, 30, 240, 90),
    ),
    includeBuffersInHeadline: merged.includeBuffersInHeadline !== false,
    showDistance: merged.showDistance !== false,
    showTimeline: merged.showTimeline !== false,
    showTechnicalDetails: merged.showTechnicalDetails !== false,
  };
}

export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.length === 0) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

const zonedFormatterCache = new Map();

function getZonedFormatter(timeZone) {
  if (!zonedFormatterCache.has(timeZone)) {
    zonedFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }),
    );
  }
  return zonedFormatterCache.get(timeZone);
}

export function getZonedParts(ms, timeZone) {
  if (!isValidTimeZone(timeZone)) return null;
  const parts = getZonedFormatter(timeZone).formatToParts(new Date(ms));
  const values = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  const hour = values.hour === 24 ? 0 : values.hour;
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour,
    minute: values.minute,
    second: values.second,
  };
}

export function getTimeZoneOffsetMinutes(timeZone, ms) {
  const zoned = getZonedParts(ms, timeZone);
  if (!zoned) return null;
  const asUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
  );
  return Math.round((asUtc - ms) / MINUTE_MS);
}

export function parseDateInput(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2000 || year > 2100) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function parseTimeInput(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function parseLocalInputs(dateValue, timeValue) {
  const date = parseDateInput(dateValue);
  const time = parseTimeInput(timeValue);
  if (!date || !time) return null;
  return { ...date, ...time };
}

export function toDateString(parts) {
  if (!parts) return "";
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function toTimeString(parts) {
  if (!parts) return "";
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

export function sameWallTime(a, b) {
  return (
    !!a &&
    !!b &&
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute
  );
}

export function calendarDayDiff(fromParts, toParts) {
  if (!fromParts || !toParts) return 0;
  const from = Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day);
  const to = Date.UTC(toParts.year, toParts.month - 1, toParts.day);
  return Math.round((to - from) / DAY_MS);
}

/**
 * Convert a wall-clock time in an IANA time zone into an exact UTC instant.
 * Handles both sides of daylight-saving changes. When a clock change creates a
 * skipped or duplicated local time, the nearest sensible instant is returned
 * together with a human-readable warning.
 */
export function resolveWallTime(parts, timeZone) {
  if (!parts) return { ok: false, error: "Enter a valid date and time." };
  if (!isValidTimeZone(timeZone)) {
    return { ok: false, error: `The time zone "${timeZone}" is not recognised.` };
  }

  const requested = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0,
    0,
  );

  const offsets = new Set();
  for (const shift of [-2 * DAY_MS, 0, 2 * DAY_MS]) {
    const offset = getTimeZoneOffsetMinutes(timeZone, requested + shift);
    if (offset !== null) offsets.add(offset);
  }

  const candidates = [...offsets].map((offset) => requested - offset * MINUTE_MS);
  const matching = [...new Set(candidates)]
    .filter((ms) => sameWallTime(getZonedParts(ms, timeZone), parts))
    .sort((a, b) => a - b);

  if (matching.length === 1) {
    return { ok: true, ms: matching[0], warning: null };
  }

  if (matching.length > 1) {
    return {
      ok: true,
      ms: matching[0],
      warning: `This local time happens twice in ${timeZone} when the clocks go back. The earlier occurrence was used.`,
    };
  }

  // Spring-forward gap: the requested wall time never appears on the clock.
  let best = null;
  for (const ms of candidates) {
    const wall = getZonedParts(ms, timeZone);
    if (!wall) continue;
    const wallAsUtc = Date.UTC(
      wall.year,
      wall.month - 1,
      wall.day,
      wall.hour,
      wall.minute,
    );
    const difference = wallAsUtc - requested;
    if (
      !best ||
      Math.abs(difference) < Math.abs(best.difference) ||
      (Math.abs(difference) === Math.abs(best.difference) && difference > 0)
    ) {
      best = { ms, difference };
    }
  }

  if (!best) {
    return { ok: false, error: "This date and time could not be resolved." };
  }

  return {
    ok: true,
    ms: best.ms,
    warning: `This local time is skipped in ${timeZone} because of a daylight-saving change. The nearest valid time was used.`,
  };
}

export function addMinutesToZonedWall(dateValue, timeValue, fromTimeZone, minutes, toTimeZone) {
  const parts = parseLocalInputs(dateValue, timeValue);
  if (!parts || !isValidTimeZone(fromTimeZone) || !isValidTimeZone(toTimeZone)) {
    return null;
  }
  const resolved = resolveWallTime(parts, fromTimeZone);
  if (!resolved.ok) return null;
  const target = getZonedParts(resolved.ms + Number(minutes) * MINUTE_MS, toTimeZone);
  if (!target) return null;
  return { date: toDateString(target), time: toTimeString(target) };
}

export function resolveAirport(code, customLabel, customTimeZone) {
  if (code === CUSTOM_AIRPORT_CODE) {
    const timezone = customTimeZone || "UTC";
    if (!isValidTimeZone(timezone)) return null;
    const label = (customLabel || "").trim().slice(0, 48) || "Custom airport";
    return {
      code: "CUSTOM",
      name: label,
      city: label,
      country: "",
      timezone,
      lat: null,
      lon: null,
      isCustom: true,
    };
  }
  return AIRPORT_MAP.get(code) || null;
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const values = [lat1, lon1, lat2, lon2].map(Number);
  if (values.some((value) => !Number.isFinite(value))) return null;
  const [a1, o1, a2, o2] = values;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(a2 - a1);
  const dLon = toRadians(o2 - o1);
  const lat1Rad = toRadians(a1);
  const lat2Rad = toRadians(a2);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────
export function formatClock(hour, minute, timeFormat = "24h") {
  const safeHour = Number.isFinite(Number(hour)) ? ((Number(hour) % 24) + 24) % 24 : 0;
  const safeMinute = Number.isFinite(Number(minute)) ? ((Number(minute) % 60) + 60) % 60 : 0;
  if (timeFormat === "12h") {
    const suffix = safeHour >= 12 ? "PM" : "AM";
    const displayHour = safeHour % 12 === 0 ? 12 : safeHour % 12;
    return `${displayHour}:${pad2(safeMinute)} ${suffix}`;
  }
  return `${pad2(safeHour)}:${pad2(safeMinute)}`;
}

export function formatDateLabel(parts) {
  if (!parts) return "—";
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(parts) {
  if (!parts) return "—";
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDuration(totalMinutes) {
  const safe = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const days = Math.floor(safe / 1440);
  const hours = Math.floor((safe % 1440) / 60);
  const minutes = safe % 60;
  if (days > 0) {
    return `${days}d${hours ? ` ${hours}h` : ""}${minutes ? ` ${minutes}m` : ""}`;
  }
  if (hours > 0) return `${hours}h${minutes ? ` ${minutes}m` : ""}`;
  return `${minutes}m`;
}

export function formatDistance(km, units = "km") {
  if (!Number.isFinite(Number(km))) return "—";
  const value = units === "mi" ? Number(km) * 0.621371 : Number(km);
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ${
    units === "mi" ? "mi" : "km"
  }`;
}

export function formatSpeed(kmh, units = "km") {
  if (!Number.isFinite(Number(kmh))) return "—";
  const value = units === "mi" ? Number(kmh) * 0.621371 : Number(kmh);
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ${
    units === "mi" ? "mph" : "km/h"
  }`;
}

export function formatUtcOffset(offsetMinutes) {
  if (!Number.isFinite(Number(offsetMinutes))) return "UTC";
  const value = Math.round(Number(offsetMinutes));
  const sign = value >= 0 ? "+" : "-";
  const absolute = Math.abs(value);
  return `UTC${sign}${pad2(Math.floor(absolute / 60))}:${pad2(absolute % 60)}`;
}

export function formatTimezoneShift(minutes) {
  if (!Number.isFinite(Number(minutes)) || Number(minutes) === 0) return "No shift";
  const value = Math.round(Number(minutes));
  const sign = value > 0 ? "+" : "−";
  return `${sign}${formatDuration(Math.abs(value))}`;
}

export function formatDayShift(days) {
  if (!Number.isFinite(Number(days)) || Number(days) === 0) return "Same day";
  const value = Math.round(Number(days));
  if (value === 1) return "Arrives next day";
  if (value === -1) return "Arrives previous day";
  return value > 1 ? `Arrives +${value} days` : `Arrives ${value} days`;
}

export function formatCountdownLabel(mode) {
  if (mode === MODES.ARRIVAL) return "Local arrival";
  if (mode === MODES.DEPARTURE) return "Local departure";
  return "Total journey";
}

// ─────────────────────────────────────────────────────────────────────────────
// Default sample
// ─────────────────────────────────────────────────────────────────────────────
export function createDefaultSegments() {
  // A fixed, deterministic sample keeps server and client markup identical.
  const date = "2027-06-15";
  return [
    {
      id: "seg-1",
      airline: "",
      flightNumber: "",
      depCode: "DAC",
      arrCode: "DXB",
      depDate: date,
      depTime: "02:30",
      arrDate: date,
      arrTime: "05:15",
      depCustomLabel: "",
      depCustomTz: "Asia/Dhaka",
      arrCustomLabel: "",
      arrCustomTz: "Asia/Dubai",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculation engine
// ─────────────────────────────────────────────────────────────────────────────
function makeError(message, extra = {}) {
  return { message, ...extra };
}

function buildLeg({
  segment,
  index,
  depAirport,
  arrAirport,
  depParts,
  arrParts,
  depMs,
  arrMs,
}) {
  const durationMinutes = Math.round((arrMs - depMs) / MINUTE_MS);
  const depOffsetMinutes = getTimeZoneOffsetMinutes(depAirport.timezone, depMs);
  const arrOffsetMinutes = getTimeZoneOffsetMinutes(arrAirport.timezone, arrMs);
  const distanceKm =
    depAirport.lat !== null &&
    depAirport.lon !== null &&
    arrAirport.lat !== null &&
    arrAirport.lon !== null
      ? haversineKm(depAirport.lat, depAirport.lon, arrAirport.lat, arrAirport.lon)
      : null;

  return {
    id: segment.id,
    index,
    label: `Flight ${index + 1}`,
    airline: (segment.airline || "").trim(),
    flightNumber: (segment.flightNumber || "").trim(),
    depAirport,
    arrAirport,
    depParts,
    arrParts,
    depMs,
    arrMs,
    durationMinutes,
    depOffsetMinutes,
    arrOffsetMinutes,
    timezoneShiftMinutes:
      depOffsetMinutes !== null && arrOffsetMinutes !== null
        ? arrOffsetMinutes - depOffsetMinutes
        : 0,
    dayShift: calendarDayDiff(depParts, arrParts),
    distanceKm,
  };
}

function buildTotals({ legs, connections, settings, firstDepMs, lastArrMs }) {
  const flightMinutes = legs.reduce((sum, leg) => sum + leg.durationMinutes, 0);
  const layoverMinutes = connections.reduce((sum, connection) => sum + connection.minutes, 0);
  const gateToGateMinutes = Math.max(
    0,
    Math.round((lastArrMs - firstDepMs) / MINUTE_MS),
  );
  const bufferMinutes = settings.preBufferMinutes + settings.postBufferMinutes;
  const doorToDoorMinutes = gateToGateMinutes + bufferMinutes;
  const distanceKm = legs.every((leg) => typeof leg.distanceKm === "number")
    ? legs.reduce((sum, leg) => sum + leg.distanceKm, 0)
    : null;
  const averageSpeedKmh =
    distanceKm !== null && flightMinutes > 0 ? distanceKm / (flightMinutes / 60) : null;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  return {
    flightMinutes,
    layoverMinutes,
    gateToGateMinutes,
    preBufferMinutes: settings.preBufferMinutes,
    postBufferMinutes: settings.postBufferMinutes,
    bufferMinutes,
    doorToDoorMinutes,
    headlineMinutes: settings.includeBuffersInHeadline
      ? doorToDoorMinutes
      : gateToGateMinutes,
    distanceKm,
    averageSpeedKmh,
    stops: Math.max(0, legs.length - 1),
    dayShift: calendarDayDiff(firstLeg.depParts, lastLeg.arrParts),
    timezoneShiftMinutes: lastLeg.arrOffsetMinutes - firstLeg.depOffsetMinutes,
    firstDeparture: {
      date: toDateString(firstLeg.depParts),
      time: toTimeString(firstLeg.depParts),
    },
    lastArrival: {
      date: toDateString(lastLeg.arrParts),
      time: toTimeString(lastLeg.arrParts),
    },
  };
}

function emptyTotals(settings) {
  return {
    flightMinutes: 0,
    layoverMinutes: 0,
    gateToGateMinutes: 0,
    preBufferMinutes: settings.preBufferMinutes,
    postBufferMinutes: settings.postBufferMinutes,
    bufferMinutes: settings.preBufferMinutes + settings.postBufferMinutes,
    doorToDoorMinutes: settings.preBufferMinutes + settings.postBufferMinutes,
    headlineMinutes: settings.preBufferMinutes + settings.postBufferMinutes,
    distanceKm: null,
    averageSpeedKmh: null,
    stops: 0,
    dayShift: 0,
    timezoneShiftMinutes: 0,
    firstDeparture: null,
    lastArrival: null,
  };
}

function validateAirportPair(segment, index, errors, warnings) {
  const label = `Flight ${index + 1}`;
  const depAirport = resolveAirport(
    segment.depCode,
    segment.depCustomLabel,
    segment.depCustomTz,
  );
  const arrAirport = resolveAirport(
    segment.arrCode,
    segment.arrCustomLabel,
    segment.arrCustomTz,
  );

  if (!depAirport) {
    errors.push(
      makeError(`Choose a departure airport for ${label}.`, {
        segmentId: segment.id,
        field: "depCode",
      }),
    );
  }
  if (!arrAirport) {
    errors.push(
      makeError(`Choose an arrival airport for ${label}.`, {
        segmentId: segment.id,
        field: "arrCode",
      }),
    );
  }
  if (
    depAirport &&
    arrAirport &&
    depAirport.code !== "CUSTOM" &&
    arrAirport.code !== "CUSTOM" &&
    depAirport.code === arrAirport.code
  ) {
    errors.push(
      makeError(
        `${label} starts and ends at the same airport. Pick a different arrival airport.`,
        { segmentId: segment.id, field: "arrCode" },
      ),
    );
  }
  if (depAirport && !isValidTimeZone(depAirport.timezone)) {
    errors.push(
      makeError(`The departure time zone for ${label} is not recognised.`, {
        segmentId: segment.id,
        field: "depCode",
      }),
    );
  }
  if (arrAirport && !isValidTimeZone(arrAirport.timezone)) {
    errors.push(
      makeError(`The arrival time zone for ${label} is not recognised.`, {
        segmentId: segment.id,
        field: "arrCode",
      }),
    );
  }

  return { depAirport, arrAirport };
}

function validateLocalTimes(segment, index, errors, warnings) {
  const label = `Flight ${index + 1}`;
  const depParts = parseLocalInputs(segment.depDate, segment.depTime);
  const arrParts = parseLocalInputs(segment.arrDate, segment.arrTime);

  if (!depParts) {
    errors.push(
      makeError(`Add a valid departure date and time for ${label}.`, {
        segmentId: segment.id,
        field: "depDate",
      }),
    );
  }
  if (!arrParts) {
    errors.push(
      makeError(`Add a valid arrival date and time for ${label}.`, {
        segmentId: segment.id,
        field: "arrDate",
      }),
    );
  }
  return { depParts, arrParts };
}

function connectionCountry(airport) {
  return (airport?.country || "").trim().toLowerCase();
}

function isInternationalConnection(previousLeg, nextLeg) {
  const originCountry = connectionCountry(previousLeg.depAirport);
  const connectionAirportCountry = connectionCountry(previousLeg.arrAirport);
  const destinationCountry = connectionCountry(nextLeg.arrAirport);
  if (!originCountry || !connectionAirportCountry || !destinationCountry) return true;
  return !(
    originCountry === connectionAirportCountry &&
    connectionAirportCountry === destinationCountry
  );
}

export function calculateDuration({ segments, settings } = {}) {
  const config = normalizeSettings(settings);
  const errors = [];
  const warnings = [];
  const safeSegments = Array.isArray(segments) ? segments : [];

  if (safeSegments.length === 0) {
    return {
      ok: false,
      mode: MODES.DURATION,
      errors: [makeError("Add at least one flight to calculate a duration.")],
      warnings: [],
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  if (safeSegments.length > MAX_SEGMENTS) {
    return {
      ok: false,
      mode: MODES.DURATION,
      errors: [
        makeError(
          `You can compare up to ${MAX_SEGMENTS} flights in one itinerary. Remove a connection to continue.`,
        ),
      ],
      warnings: [],
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const legs = [];

  safeSegments.forEach((segment, index) => {
    const label = `Flight ${index + 1}`;
    const { depAirport, arrAirport } = validateAirportPair(
      segment,
      index,
      errors,
      warnings,
    );
    const { depParts, arrParts } = validateLocalTimes(
      segment,
      index,
      errors,
      warnings,
    );

    if (!depAirport || !arrAirport || !depParts || !arrParts) return;
    if (!isValidTimeZone(depAirport.timezone) || !isValidTimeZone(arrAirport.timezone)) {
      return;
    }

    const departure = resolveWallTime(depParts, depAirport.timezone);
    const arrival = resolveWallTime(arrParts, arrAirport.timezone);

    if (!departure.ok) {
      errors.push(
        makeError(`${label}: ${departure.error}`, {
          segmentId: segment.id,
          field: "depDate",
        }),
      );
      return;
    }
    if (!arrival.ok) {
      errors.push(
        makeError(`${label}: ${arrival.error}`, {
          segmentId: segment.id,
          field: "arrDate",
        }),
      );
      return;
    }

    if (departure.warning) {
      warnings.push({
        message: `${label}: ${departure.warning}`,
        segmentId: segment.id,
        field: "depDate",
        tone: "info",
      });
    }
    if (arrival.warning) {
      warnings.push({
        message: `${label}: ${arrival.warning}`,
        segmentId: segment.id,
        field: "arrDate",
        tone: "info",
      });
    }

    const durationMinutes = Math.round((arrival.ms - departure.ms) / MINUTE_MS);

    if (durationMinutes <= 0) {
      errors.push(
        makeError(
          `${label} arrives before it departs. If you land on the next day, move the arrival date forward.`,
          { segmentId: segment.id, field: "arrDate" },
        ),
      );
      return;
    }

    if (durationMinutes < MIN_FLIGHT_MINUTES) {
      errors.push(
        makeError(
          `${label} is only ${formatDuration(durationMinutes)}. Check the departure and arrival times.`,
          { segmentId: segment.id, field: "arrDate" },
        ),
      );
      return;
    }

    if (durationMinutes > MAX_FLIGHT_MINUTES) {
      errors.push(
        makeError(
          `${label} is longer than 72 hours. Check the dates and time zones.`,
          { segmentId: segment.id, field: "arrDate" },
        ),
      );
      return;
    }

    legs.push(
      buildLeg({
        segment,
        index,
        depAirport,
        arrAirport,
        depParts,
        arrParts,
        depMs: departure.ms,
        arrMs: arrival.ms,
      }),
    );
  });

  if (errors.length > 0) {
    return {
      ok: false,
      mode: MODES.DURATION,
      errors,
      warnings,
      legs,
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const connections = [];

  for (let index = 0; index < legs.length - 1; index += 1) {
    const previousLeg = legs[index];
    const nextLeg = legs[index + 1];
    const gapMinutes = Math.round((nextLeg.depMs - previousLeg.arrMs) / MINUTE_MS);
    const international = isInternationalConnection(previousLeg, nextLeg);
    const minimumMinutes = international
      ? config.minInternationalConnection
      : config.minDomesticConnection;

    if (gapMinutes < 0) {
      errors.push(
        makeError(
          `${nextLeg.label} departs before ${previousLeg.label} lands. Adjust the connection date or time.`,
          { segmentId: nextLeg.id, field: "depDate" },
        ),
      );
      continue;
    }

    if (gapMinutes < 15) {
      errors.push(
        makeError(
          `There is only ${formatDuration(gapMinutes)} between ${previousLeg.label} and ${nextLeg.label} in ${
            previousLeg.arrAirport.city
          }. That is too short to change planes.`,
          { segmentId: nextLeg.id, field: "depDate" },
        ),
      );
      continue;
    }

    let level = "comfortable";
    if (gapMinutes < minimumMinutes) level = "below-minimum";
    else if (gapMinutes < minimumMinutes + 30) level = "tight";
    else if (gapMinutes > 8 * 60) level = "long";

    connections.push({
      id: `connection-${previousLeg.id}-${nextLeg.id}`,
      afterLegId: previousLeg.id,
      beforeLegId: nextLeg.id,
      airport: previousLeg.arrAirport,
      minutes: gapMinutes,
      minimumMinutes,
      isInternational: international,
      level,
      fromLabel: previousLeg.label,
      toLabel: nextLeg.label,
    });

    if (level === "below-minimum") {
      warnings.push({
        message: `Your layover in ${previousLeg.arrAirport.city} is ${formatDuration(
          gapMinutes,
        )}, below the ${minimumMinutes}-minute ${
          international ? "international" : "domestic"
        } minimum you set. Consider a later connection.`,
        segmentId: nextLeg.id,
        field: "connection",
        tone: "warning",
      });
    } else if (level === "tight") {
      warnings.push({
        message: `Your ${formatDuration(gapMinutes)} layover in ${
          previousLeg.arrAirport.city
        } is tight for ${international ? "an international" : "a domestic"} connection. A 30-minute delay could make you miss the next flight.`,
        segmentId: nextLeg.id,
        field: "connection",
        tone: "caution",
      });
    } else if (level === "long") {
      warnings.push({
        message: `Your layover in ${previousLeg.arrAirport.city} is ${formatDuration(
          gapMinutes,
        )}. Plan meals, lounge access or a short city visit to make the wait comfortable.`,
        segmentId: nextLeg.id,
        field: "connection",
        tone: "info",
      });
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      mode: MODES.DURATION,
      errors,
      warnings,
      legs,
      connections,
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  const totals = buildTotals({
    legs,
    connections,
    settings: config,
    firstDepMs: firstLeg.depMs,
    lastArrMs: lastLeg.arrMs,
  });

  if (totals.averageSpeedKmh !== null && totals.averageSpeedKmh > 1200) {
    warnings.push({
      message:
        "The average speed is unusually high for a commercial flight. Double-check the dates and time zones.",
      tone: "caution",
    });
  }

  return {
    ok: true,
    mode: MODES.DURATION,
    errors,
    warnings,
    legs,
    connections,
    totals,
    settings: config,
  };
}

export function calculateArrival({ segments, durationMinutes, settings } = {}) {
  const config = normalizeSettings(settings);
  const errors = [];
  const warnings = [];
  const segment = Array.isArray(segments) ? segments[0] : null;

  if (!segment) {
    return {
      ok: false,
      mode: MODES.ARRIVAL,
      errors: [makeError("Add a flight route to calculate an arrival time.")],
      warnings: [],
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const { depAirport, arrAirport } = validateAirportPair(segment, 0, errors, warnings);
  const depParts = parseLocalInputs(segment.depDate, segment.depTime);
  if (!depParts) {
    errors.push(
      makeError("Add a valid departure date and time for Flight 1.", {
        segmentId: segment.id,
        field: "depDate",
      }),
    );
  }

  const duration = Math.round(Number(durationMinutes));
  if (!Number.isFinite(duration) || duration < MIN_FLIGHT_MINUTES) {
    errors.push(
      makeError("Enter a flight duration of at least 10 minutes.", {
        field: "duration",
      }),
    );
  } else if (duration > MAX_FLIGHT_MINUTES) {
    errors.push(
      makeError("Enter a flight duration shorter than 72 hours.", { field: "duration" }),
    );
  }

  if (errors.length > 0 || !depAirport || !arrAirport || !depParts) {
    return {
      ok: false,
      mode: MODES.ARRIVAL,
      errors,
      warnings,
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const departure = resolveWallTime(depParts, depAirport.timezone);
  if (!departure.ok) {
    return {
      ok: false,
      mode: MODES.ARRIVAL,
      errors: [makeError(`Flight 1: ${departure.error}`, { field: "depDate" })],
      warnings,
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }
  if (departure.warning) {
    warnings.push({
      message: `Flight 1: ${departure.warning}`,
      segmentId: segment.id,
      field: "depDate",
      tone: "info",
    });
  }

  const arrivalMs = departure.ms + duration * MINUTE_MS;
  const arrParts = getZonedParts(arrivalMs, arrAirport.timezone);
  if (!arrParts) {
    return {
      ok: false,
      mode: MODES.ARRIVAL,
      errors: [makeError("The arrival time zone could not be resolved.")],
      warnings,
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const leg = buildLeg({
    segment,
    index: 0,
    depAirport,
    arrAirport,
    depParts,
    arrParts,
    depMs: departure.ms,
    arrMs: arrivalMs,
  });

  const totals = buildTotals({
    legs: [leg],
    connections: [],
    settings: config,
    firstDepMs: leg.depMs,
    lastArrMs: leg.arrMs,
  });

  return {
    ok: true,
    mode: MODES.ARRIVAL,
    errors,
    warnings,
    legs: [leg],
    connections: [],
    totals,
    settings: config,
  };
}

export function calculateDeparture({ segments, durationMinutes, settings } = {}) {
  const config = normalizeSettings(settings);
  const errors = [];
  const warnings = [];
  const segment = Array.isArray(segments) ? segments[0] : null;

  if (!segment) {
    return {
      ok: false,
      mode: MODES.DEPARTURE,
      errors: [makeError("Add a flight route to calculate a departure time.")],
      warnings: [],
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const { depAirport, arrAirport } = validateAirportPair(segment, 0, errors, warnings);
  const arrParts = parseLocalInputs(segment.arrDate, segment.arrTime);
  if (!arrParts) {
    errors.push(
      makeError("Add a valid arrival date and time for Flight 1.", {
        segmentId: segment.id,
        field: "arrDate",
      }),
    );
  }

  const duration = Math.round(Number(durationMinutes));
  if (!Number.isFinite(duration) || duration < MIN_FLIGHT_MINUTES) {
    errors.push(
      makeError("Enter a flight duration of at least 10 minutes.", {
        field: "duration",
      }),
    );
  } else if (duration > MAX_FLIGHT_MINUTES) {
    errors.push(
      makeError("Enter a flight duration shorter than 72 hours.", { field: "duration" }),
    );
  }

  if (errors.length > 0 || !depAirport || !arrAirport || !arrParts) {
    return {
      ok: false,
      mode: MODES.DEPARTURE,
      errors,
      warnings,
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const arrival = resolveWallTime(arrParts, arrAirport.timezone);
  if (!arrival.ok) {
    return {
      ok: false,
      mode: MODES.DEPARTURE,
      errors: [makeError(`Flight 1: ${arrival.error}`, { field: "arrDate" })],
      warnings,
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }
  if (arrival.warning) {
    warnings.push({
      message: `Flight 1: ${arrival.warning}`,
      segmentId: segment.id,
      field: "arrDate",
      tone: "info",
    });
  }

  const departureMs = arrival.ms - duration * MINUTE_MS;
  const depParts = getZonedParts(departureMs, depAirport.timezone);
  if (!depParts) {
    return {
      ok: false,
      mode: MODES.DEPARTURE,
      errors: [makeError("The departure time zone could not be resolved.")],
      warnings,
      legs: [],
      connections: [],
      totals: emptyTotals(config),
      settings: config,
    };
  }

  const leg = buildLeg({
    segment,
    index: 0,
    depAirport,
    arrAirport,
    depParts,
    arrParts,
    depMs: departureMs,
    arrMs: arrival.ms,
  });

  const totals = buildTotals({
    legs: [leg],
    connections: [],
    settings: config,
    firstDepMs: leg.depMs,
    lastArrMs: leg.arrMs,
  });

  return {
    ok: true,
    mode: MODES.DEPARTURE,
    errors,
    warnings,
    legs: [leg],
    connections: [],
    totals,
    settings: config,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Editorial content
// ─────────────────────────────────────────────────────────────────────────────
export const FLIGHT_TIPS = [
  {
    id: "time-zones",
    icon: "Globe2",
    title: "Time zones, calculated properly",
    detail:
      "Every airport has a real IANA time zone. The calculator converts each local clock time to UTC before subtracting, so daylight saving and half-hour offsets never distort the result.",
  },
  {
    id: "connections",
    icon: "Route",
    title: "Connections get a reality check",
    detail:
      "Layovers are compared with the minimum connection time you set for domestic and international transfers. Short gaps are flagged before you book.",
  },
  {
    id: "door-to-door",
    icon: "Luggage",
    title: "Door-to-door, not just airborne",
    detail:
      "Add airport check-in and post-flight buffers to see the time your trip actually takes — from arriving at the airport to leaving the destination terminal.",
  },
];

export const FLIGHT_FAQS = [
  {
    question: "How does the Flight Duration Calculator work?",
    answer:
      "It converts the departure time at the origin airport and the arrival time at the destination airport from their local time zones into UTC, then subtracts the two instants. Because both clocks are normalised first, a +2, +5 or even +14 hour time-zone shift never inflates or shortens the flight. For connecting itineraries it repeats the calculation for every flight and adds the layovers between them.",
  },
  {
    question: "Does it handle daylight saving time and unusual time zones?",
    answer:
      "Yes. Each airport is paired with an IANA time zone, and the browser's time-zone database applies the correct offset for the exact travel date — including daylight saving changes in Europe, North America, Australia and New Zealand, plus half-hour and 45-minute zones such as India, Nepal and Myanmar. If a local time is skipped or repeated when the clocks change, the tool uses the nearest valid instant and shows a clear note instead of silently producing a wrong answer.",
  },
  {
    question: "What is the difference between flight time and total journey time?",
    answer:
      "Flight time is the time from wheels-up to wheels-down. Total journey time, or gate-to-gate time, is the elapsed time from the first departure to the final arrival, so it includes every layover. Door-to-door time adds your pre-departure airport buffer and post-arrival buffer on top. The result panel shows all three separately so you can compare the airborne time with the real-world time commitment.",
  },
  {
    question: "Can I calculate my arrival time if I only know the departure time and flight duration?",
    answer:
      "Yes. Switch to the Arrival time mode, choose the route, enter the local departure date and time, and add the flight duration. The calculator finds the exact arrival instant and displays it in the destination airport's local time, including the correct date if you cross midnight or the International Date Line. The Departure time mode does the same calculation in reverse when you know when you need to land.",
  },
  {
    question: "How are layovers and connection risks evaluated?",
    answer:
      "For every connection, the tool subtracts the previous arrival from the next departure and compares the gap with the minimum connection time you set for domestic or international transfers. Gaps below the minimum are flagged as a warning, gaps just above it are marked tight, and very long waits are marked as long layovers. A negative gap or a connection under 15 minutes is treated as an error because the itinerary cannot physically work.",
  },
  {
    question: "Why does my arrival show a different date from my departure?",
    answer:
      "That is usually correct. A flight that leaves Dhaka at 02:30 and lands in Dubai at 05:15 is only 4 hours 45 minutes in the air, but a flight from Dhaka to New York can leave and land on the same calendar date while still taking 15 or more hours. The calculator shows the local date at each airport, a day-shift badge such as “Arrives next day”, and a time-zone shift chip so the calendar change is easy to understand.",
  },
  {
    question: "Can I calculate multi-city trips with more than one connection?",
    answer:
      "Yes. In Flight duration mode, use Add connection to build an itinerary with up to six flights. Each flight has its own airports, local departure and arrival times, airline and flight number. The tool calculates every leg, the wait between each pair, the total flight time and the complete journey, then includes the full itinerary in the copy summary and PDF report.",
  },
  {
    question: "Is my itinerary private, and does the calculator work offline?",
    answer:
      "Everything runs 100% in your browser. Airport choices, dates, airline names and results are never uploaded, logged or sent to a server. Once the page has loaded, you can keep calculating routes even without a connection, which makes the tool safe for private travel plans and corporate itineraries.",
  },
];
