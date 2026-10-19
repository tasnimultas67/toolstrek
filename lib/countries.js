/**
 * Master country registry for the Visited Countries Map tool.
 *
 * Source of truth for the tracker state. Each country is keyed by its
 * ISO 3166-1 alpha-2 code (used for flags, storage & share URLs) and also
 * carries the alpha-3 code (matches world GeoJSON feature `id`s), name and
 * region for grouping/filtering.
 *
 * Kept in sync with the fetched world geometry by ISO-3 code.
 */

export const REGIONS = [
  { id: "africa", label: "Africa" },
  { id: "asia", label: "Asia" },
  { id: "europe", label: "Europe" },
  { id: "north-america", label: "North America" },
  { id: "south-america", label: "South America" },
  { id: "oceania", label: "Oceania" },
];

/**
 * Complete country list.
 * iso2  - ISO 3166-1 alpha-2 (flags, storage key)
 * iso3  - ISO 3166-1 alpha-3 (matches GeoJSON feature.id)
 * name  - Common English name
 * region - One of REGIONS ids
 */
export const COUNTRIES = [
  // Africa
  { iso2: "DZ", iso3: "DZA", name: "Algeria", region: "africa" },
  { iso2: "AO", iso3: "AGO", name: "Angola", region: "africa" },
  { iso2: "BJ", iso3: "BEN", name: "Benin", region: "africa" },
  { iso2: "BW", iso3: "BWA", name: "Botswana", region: "africa" },
  { iso2: "BF", iso3: "BFA", name: "Burkina Faso", region: "africa" },
  { iso2: "BI", iso3: "BDI", name: "Burundi", region: "africa" },
  { iso2: "CV", iso3: "CPV", name: "Cabo Verde", region: "africa" },
  { iso2: "CM", iso3: "CMR", name: "Cameroon", region: "africa" },
  { iso2: "CF", iso3: "CAF", name: "Central African Republic", region: "africa" },
  { iso2: "TD", iso3: "TCD", name: "Chad", region: "africa" },
  { iso2: "KM", iso3: "COM", name: "Comoros", region: "africa" },
  { iso2: "CD", iso3: "COD", name: "Democratic Republic of the Congo", region: "africa" },
  { iso2: "CG", iso3: "COG", name: "Republic of the Congo", region: "africa" },
  { iso2: "CI", iso3: "CIV", name: "Côte d'Ivoire", region: "africa" },
  { iso2: "DJ", iso3: "DJI", name: "Djibouti", region: "africa" },
  { iso2: "EG", iso3: "EGY", name: "Egypt", region: "africa" },
  { iso2: "ER", iso3: "ERI", name: "Eritrea", region: "africa" },
  { iso2: "SZ", iso3: "SWZ", name: "Eswatini", region: "africa" },
  { iso2: "ET", iso3: "ETH", name: "Ethiopia", region: "africa" },
  { iso2: "GA", iso3: "GAB", name: "Gabon", region: "africa" },
  { iso2: "GM", iso3: "GMB", name: "Gambia", region: "africa" },
  { iso2: "GH", iso3: "GHA", name: "Ghana", region: "africa" },
  { iso2: "GN", iso3: "GIN", name: "Guinea", region: "africa" },
  { iso2: "GW", iso3: "GNB", name: "Guinea-Bissau", region: "africa" },
  { iso2: "KE", iso3: "KEN", name: "Kenya", region: "africa" },
  { iso2: "LS", iso3: "LSO", name: "Lesotho", region: "africa" },
  { iso2: "LR", iso3: "LBR", name: "Liberia", region: "africa" },
  { iso2: "LY", iso3: "LBY", name: "Libya", region: "africa" },
  { iso2: "MG", iso3: "MDG", name: "Madagascar", region: "africa" },
  { iso2: "MW", iso3: "MWI", name: "Malawi", region: "africa" },
  { iso2: "ML", iso3: "MLI", name: "Mali", region: "africa" },
  { iso2: "MR", iso3: "MRT", name: "Mauritania", region: "africa" },
  { iso2: "MU", iso3: "MUS", name: "Mauritius", region: "africa" },
  { iso2: "MA", iso3: "MAR", name: "Morocco", region: "africa" },
  { iso2: "MZ", iso3: "MOZ", name: "Mozambique", region: "africa" },
  { iso2: "NA", iso3: "NAM", name: "Namibia", region: "africa" },
  { iso2: "NE", iso3: "NER", name: "Niger", region: "africa" },
  { iso2: "NG", iso3: "NGA", name: "Nigeria", region: "africa" },
  { iso2: "RW", iso3: "RWA", name: "Rwanda", region: "africa" },
  { iso2: "ST", iso3: "STP", name: "São Tomé and Príncipe", region: "africa" },
  { iso2: "SN", iso3: "SEN", name: "Senegal", region: "africa" },
  { iso2: "SC", iso3: "SYC", name: "Seychelles", region: "africa" },
  { iso2: "SL", iso3: "SLE", name: "Sierra Leone", region: "africa" },
  { iso2: "SO", iso3: "SOM", name: "Somalia", region: "africa" },
  { iso2: "ZA", iso3: "ZAF", name: "South Africa", region: "africa" },
  { iso2: "SS", iso3: "SSD", name: "South Sudan", region: "africa" },
  { iso2: "SD", iso3: "SDN", name: "Sudan", region: "africa" },
  { iso2: "TZ", iso3: "TZA", name: "Tanzania", region: "africa" },
  { iso2: "TG", iso3: "TGO", name: "Togo", region: "africa" },
  { iso2: "TN", iso3: "TUN", name: "Tunisia", region: "africa" },
  { iso2: "UG", iso3: "UGA", name: "Uganda", region: "africa" },
  { iso2: "ZM", iso3: "ZMB", name: "Zambia", region: "africa" },
  { iso2: "ZW", iso3: "ZWE", name: "Zimbabwe", region: "africa" },

  // Asia
  { iso2: "AF", iso3: "AFG", name: "Afghanistan", region: "asia" },
  { iso2: "AM", iso3: "ARM", name: "Armenia", region: "asia" },
  { iso2: "AZ", iso3: "AZE", name: "Azerbaijan", region: "asia" },
  { iso2: "BH", iso3: "BHR", name: "Bahrain", region: "asia" },
  { iso2: "BD", iso3: "BGD", name: "Bangladesh", region: "asia" },
  { iso2: "BT", iso3: "BTN", name: "Bhutan", region: "asia" },
  { iso2: "BN", iso3: "BRN", name: "Brunei", region: "asia" },
  { iso2: "KH", iso3: "KHM", name: "Cambodia", region: "asia" },
  { iso2: "CN", iso3: "CHN", name: "China", region: "asia" },
  { iso2: "GE", iso3: "GEO", name: "Georgia", region: "asia" },
  { iso2: "IN", iso3: "IND", name: "India", region: "asia" },
  { iso2: "ID", iso3: "IDN", name: "Indonesia", region: "asia" },
  { iso2: "IR", iso3: "IRN", name: "Iran", region: "asia" },
  { iso2: "IQ", iso3: "IRQ", name: "Iraq", region: "asia" },
  { iso2: "IL", iso3: "ISR", name: "Israel", region: "asia" },
  { iso2: "JP", iso3: "JPN", name: "Japan", region: "asia" },
  { iso2: "JO", iso3: "JOR", name: "Jordan", region: "asia" },
  { iso2: "KZ", iso3: "KAZ", name: "Kazakhstan", region: "asia" },
  { iso2: "KW", iso3: "KWT", name: "Kuwait", region: "asia" },
  { iso2: "KG", iso3: "KGZ", name: "Kyrgyzstan", region: "asia" },
  { iso2: "LA", iso3: "LAO", name: "Laos", region: "asia" },
  { iso2: "LB", iso3: "LBN", name: "Lebanon", region: "asia" },
  { iso2: "MO", iso3: "MAC", name: "Macao", region: "asia" },
  { iso2: "MY", iso3: "MYS", name: "Malaysia", region: "asia" },
  { iso2: "MV", iso3: "MDV", name: "Maldives", region: "asia" },
  { iso2: "MN", iso3: "MNG", name: "Mongolia", region: "asia" },
  { iso2: "MM", iso3: "MMR", name: "Myanmar", region: "asia" },
  { iso2: "NP", iso3: "NPL", name: "Nepal", region: "asia" },
  { iso2: "KP", iso3: "PRK", name: "North Korea", region: "asia" },
  { iso2: "OM", iso3: "OMN", name: "Oman", region: "asia" },
  { iso2: "PK", iso3: "PAK", name: "Pakistan", region: "asia" },
  { iso2: "PS", iso3: "PSE", name: "Palestine", region: "asia" },
  { iso2: "PH", iso3: "PHL", name: "Philippines", region: "asia" },
  { iso2: "QA", iso3: "QAT", name: "Qatar", region: "asia" },
  { iso2: "SA", iso3: "SAU", name: "Saudi Arabia", region: "asia" },
  { iso2: "SG", iso3: "SGP", name: "Singapore", region: "asia" },
  { iso2: "KR", iso3: "KOR", name: "South Korea", region: "asia" },
  { iso2: "LK", iso3: "LKA", name: "Sri Lanka", region: "asia" },
  { iso2: "SY", iso3: "SYR", name: "Syria", region: "asia" },
  { iso2: "TW", iso3: "TWN", name: "Taiwan", region: "asia" },
  { iso2: "TJ", iso3: "TJK", name: "Tajikistan", region: "asia" },
  { iso2: "TH", iso3: "THA", name: "Thailand", region: "asia" },
  { iso2: "TL", iso3: "TLS", name: "Timor-Leste", region: "asia" },
  { iso2: "TR", iso3: "TUR", name: "Türkiye", region: "asia" },
  { iso2: "TM", iso3: "TKM", name: "Turkmenistan", region: "asia" },
  { iso2: "AE", iso3: "ARE", name: "United Arab Emirates", region: "asia" },
  { iso2: "UZ", iso3: "UZB", name: "Uzbekistan", region: "asia" },
  { iso2: "VN", iso3: "VNM", name: "Vietnam", region: "asia" },
  { iso2: "YE", iso3: "YEM", name: "Yemen", region: "asia" },

  // Europe
  { iso2: "AL", iso3: "ALB", name: "Albania", region: "europe" },
  { iso2: "AD", iso3: "AND", name: "Andorra", region: "europe" },
  { iso2: "AT", iso3: "AUT", name: "Austria", region: "europe" },
  { iso2: "BY", iso3: "BLR", name: "Belarus", region: "europe" },
  { iso2: "BE", iso3: "BEL", name: "Belgium", region: "europe" },
  { iso2: "BA", iso3: "BIH", name: "Bosnia and Herzegovina", region: "europe" },
  { iso2: "BG", iso3: "BGR", name: "Bulgaria", region: "europe" },
  { iso2: "HR", iso3: "HRV", name: "Croatia", region: "europe" },
  { iso2: "CY", iso3: "CYP", name: "Cyprus", region: "europe" },
  { iso2: "CZ", iso3: "CZE", name: "Czechia", region: "europe" },
  { iso2: "DK", iso3: "DNK", name: "Denmark", region: "europe" },
  { iso2: "EE", iso3: "EST", name: "Estonia", region: "europe" },
  { iso2: "FI", iso3: "FIN", name: "Finland", region: "europe" },
  { iso2: "FR", iso3: "FRA", name: "France", region: "europe" },
  { iso2: "DE", iso3: "DEU", name: "Germany", region: "europe" },
  { iso2: "GR", iso3: "GRC", name: "Greece", region: "europe" },
  { iso2: "HU", iso3: "HUN", name: "Hungary", region: "europe" },
  { iso2: "IS", iso3: "ISL", name: "Iceland", region: "europe" },
  { iso2: "IE", iso3: "IRL", name: "Ireland", region: "europe" },
  { iso2: "IT", iso3: "ITA", name: "Italy", region: "europe" },
  { iso2: "XK", iso3: "XKX", name: "Kosovo", region: "europe" },
  { iso2: "LV", iso3: "LVA", name: "Latvia", region: "europe" },
  { iso2: "LI", iso3: "LIE", name: "Liechtenstein", region: "europe" },
  { iso2: "LT", iso3: "LTU", name: "Lithuania", region: "europe" },
  { iso2: "LU", iso3: "LUX", name: "Luxembourg", region: "europe" },
  { iso2: "MT", iso3: "MLT", name: "Malta", region: "europe" },
  { iso2: "MD", iso3: "MDA", name: "Moldova", region: "europe" },
  { iso2: "MC", iso3: "MCO", name: "Monaco", region: "europe" },
  { iso2: "ME", iso3: "MNE", name: "Montenegro", region: "europe" },
  { iso2: "NL", iso3: "NLD", name: "Netherlands", region: "europe" },
  { iso2: "MK", iso3: "MKD", name: "North Macedonia", region: "europe" },
  { iso2: "NO", iso3: "NOR", name: "Norway", region: "europe" },
  { iso2: "PL", iso3: "POL", name: "Poland", region: "europe" },
  { iso2: "PT", iso3: "PRT", name: "Portugal", region: "europe" },
  { iso2: "RO", iso3: "ROU", name: "Romania", region: "europe" },
  { iso2: "RU", iso3: "RUS", name: "Russia", region: "europe" },
  { iso2: "SM", iso3: "SMR", name: "San Marino", region: "europe" },
  { iso2: "RS", iso3: "SRB", name: "Serbia", region: "europe" },
  { iso2: "SK", iso3: "SVK", name: "Slovakia", region: "europe" },
  { iso2: "SI", iso3: "SVN", name: "Slovenia", region: "europe" },
  { iso2: "ES", iso3: "ESP", name: "Spain", region: "europe" },
  { iso2: "SE", iso3: "SWE", name: "Sweden", region: "europe" },
  { iso2: "CH", iso3: "CHE", name: "Switzerland", region: "europe" },
  { iso2: "UA", iso3: "UKR", name: "Ukraine", region: "europe" },
  { iso2: "GB", iso3: "GBR", name: "United Kingdom", region: "europe" },
  { iso2: "VA", iso3: "VAT", name: "Vatican City", region: "europe" },

  // North America
  { iso2: "AG", iso3: "ATG", name: "Antigua and Barbuda", region: "north-america" },
  { iso2: "BS", iso3: "BHS", name: "Bahamas", region: "north-america" },
  { iso2: "BB", iso3: "BRB", name: "Barbados", region: "north-america" },
  { iso2: "BZ", iso3: "BLZ", name: "Belize", region: "north-america" },
  { iso2: "CA", iso3: "CAN", name: "Canada", region: "north-america" },
  { iso2: "CR", iso3: "CRI", name: "Costa Rica", region: "north-america" },
  { iso2: "CU", iso3: "CUB", name: "Cuba", region: "north-america" },
  { iso2: "DM", iso3: "DMA", name: "Dominica", region: "north-america" },
  { iso2: "DO", iso3: "DOM", name: "Dominican Republic", region: "north-america" },
  { iso2: "SV", iso3: "SLV", name: "El Salvador", region: "north-america" },
  { iso2: "GT", iso3: "GTM", name: "Guatemala", region: "north-america" },
  { iso2: "HT", iso3: "HTI", name: "Haiti", region: "north-america" },
  { iso2: "HN", iso3: "HND", name: "Honduras", region: "north-america" },
  { iso2: "JM", iso3: "JAM", name: "Jamaica", region: "north-america" },
  { iso2: "MX", iso3: "MEX", name: "Mexico", region: "north-america" },
  { iso2: "NI", iso3: "NIC", name: "Nicaragua", region: "north-america" },
  { iso2: "PA", iso3: "PAN", name: "Panama", region: "north-america" },
  { iso2: "KY", iso3: "CYM", name: "Cayman Islands", region: "north-america" },
  { iso2: "PR", iso3: "PRI", name: "Puerto Rico", region: "north-america" },
  { iso2: "US", iso3: "USA", name: "United States", region: "north-america" },

  // South America
  { iso2: "AR", iso3: "ARG", name: "Argentina", region: "south-america" },
  { iso2: "BO", iso3: "BOL", name: "Bolivia", region: "south-america" },
  { iso2: "BR", iso3: "BRA", name: "Brazil", region: "south-america" },
  { iso2: "CL", iso3: "CHL", name: "Chile", region: "south-america" },
  { iso2: "CO", iso3: "COL", name: "Colombia", region: "south-america" },
  { iso2: "EC", iso3: "ECU", name: "Ecuador", region: "south-america" },
  { iso2: "GY", iso3: "GUY", name: "Guyana", region: "south-america" },
  { iso2: "PY", iso3: "PRY", name: "Paraguay", region: "south-america" },
  { iso2: "PE", iso3: "PER", name: "Peru", region: "south-america" },
  { iso2: "SR", iso3: "SUR", name: "Suriname", region: "south-america" },
  { iso2: "UY", iso3: "URY", name: "Uruguay", region: "south-america" },
  { iso2: "VE", iso3: "VEN", name: "Venezuela", region: "south-america" },

  // Oceania
  { iso2: "FJ", iso3: "FJI", name: "Fiji", region: "oceania" },
  { iso2: "KI", iso3: "KIR", name: "Kiribati", region: "oceania" },
  { iso2: "MH", iso3: "MHL", name: "Marshall Islands", region: "oceania" },
  { iso2: "FM", iso3: "FSM", name: "Micronesia", region: "oceania" },
  { iso2: "NR", iso3: "NRU", name: "Nauru", region: "oceania" },
  { iso2: "NZ", iso3: "NZL", name: "New Zealand", region: "oceania" },
  { iso2: "PW", iso3: "PLW", name: "Palau", region: "oceania" },
  { iso2: "PG", iso3: "PNG", name: "Papua New Guinea", region: "oceania" },
  { iso2: "WS", iso3: "WSM", name: "Samoa", region: "oceania" },
  { iso2: "SB", iso3: "SLB", name: "Solomon Islands", region: "oceania" },
  { iso2: "TO", iso3: "TON", name: "Tonga", region: "oceania" },
  { iso2: "TV", iso3: "TUV", name: "Tuvalu", region: "oceania" },
  { iso2: "VU", iso3: "VUT", name: "Vanuatu", region: "oceania" },
  { iso2: "AU", iso3: "AUS", name: "Australia", region: "oceania" },
];

export const TOTAL_COUNTRIES = COUNTRIES.length;

/**
 * Build a lookup map from ISO-3 -> country entry (for matching GeoJSON ids).
 */
export const BY_ISO3 = new Map(COUNTRIES.map((c) => [c.iso3, c]));

/**
 * Build a lookup map from ISO-2 -> country entry.
 */
export const BY_ISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));

/**
 * Normalize a raw visited value (string of comma separated ISO-2 codes)
 * into a clean Set of upper-case ISO-2 codes that actually exist in our list.
 */
export function normalizeVisited(raw) {
  if (!raw) return new Set();
  const codes = String(raw)
    .split(/[,;\s]+/)
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const set = new Set();
  for (const code of codes) {
    if (BY_ISO2.has(code)) set.add(code);
  }
  return set;
}

/**
 * Serialize a visited Set into a comma separated ISO-2 string.
 */
export function serializeVisited(visited) {
  return Array.from(visited).sort().join(",");
}

const countriesApi = {
  COUNTRIES,
  TOTAL_COUNTRIES,
  REGIONS,
  BY_ISO2,
  BY_ISO3,
  normalizeVisited,
  serializeVisited,
};

export default countriesApi;
