/**
 * World geometry loader for the Visited Countries Map.
 *
 * Fetches a world countries GeoJSON (with multiple CDN fallbacks + retry),
 * converts each country polygon into an SVG path string using a simple
 * equirectangular (plate carrée) projection, and caches the result.
 *
 * If every remote source fails, a built-in simplified world outline is used
 * so the tool never renders a blank map — it degrades gracefully to a
 * checklist-only tracker instead.
 */

import { COUNTRIES, BY_ISO3, TOTAL_COUNTRIES } from "./countries.js";

// ---------------------------------------------------------------------------
// Remote GeoJSON sources (tried in order, first success wins)
// ---------------------------------------------------------------------------
const GEOJSON_SOURCES = [
  "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json",
  "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json",
];

// Simple built-in fallback world outline (equirectangular, normalized 0..1).
// Used only when every remote source fails so the tool stays functional.
const FALLBACK_WORLD = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "WLD",
      properties: { name: "World" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-180, -66],
            [180, -66],
            [180, 84],
            [-180, 84],
            [-180, -66],
          ],
        ],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Fetch helpers (browser-safe; AbortController with setTimeout fallback)
// ---------------------------------------------------------------------------

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), ms);
  });
}

async function fetchWithTimeout(url, ms = 12000) {
  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const abort = () => {
    if (controller) controller.abort();
  };
  const timer = setTimeout(abort, ms);
  try {
    const res = await Promise.race([
      fetch(url, controller ? { signal: controller.signal } : {}),
      timeoutPromise(ms),
    ]);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Projection: equirectangular (plate carrée) -> SVG path string
// ---------------------------------------------------------------------------
//
// The vertical bounds are deliberately cropped (rather than the full -90..90)
// so the map fills its frame edge-to-edge, close to the reference travel-map
// look. 84°N covers Greenland's northern tip; 66°S sits just below Cape Horn
// and comfortably above Antarctica (which is not a country and is excluded).
export const MAP_LAT_TOP = 84;
export const MAP_LAT_BOTTOM = -66;
export const MAP_LON_LEFT = -180;
export const MAP_LON_RIGHT = 180;

/** Aspect ratio (width / height) implied by the cropped projection. */
export const MAP_ASPECT_RATIO =
  360 / (MAP_LAT_TOP - MAP_LAT_BOTTOM);

/** Project [lon, lat] to [x, y] inside a width x height SVG. */
export function projectPoint(lon, lat, width, height) {
  const x =
    ((lon - MAP_LON_LEFT) / (MAP_LON_RIGHT - MAP_LON_LEFT)) * width;
  const y = ((MAP_LAT_TOP - lat) / (MAP_LAT_TOP - MAP_LAT_BOTTOM)) * height;
  return [x, y];
}

/** Flatten a GeoJSON geometry into an array of rings (each ring = [lon,lat][]). */
function extractRings(geometry) {
  const rings = [];
  const type = geometry.type;
  const coords = geometry.coordinates;

  if (type === "Polygon") {
    coords.forEach((ring) => rings.push(ring));
  } else if (type === "MultiPolygon") {
    coords.forEach((polygon) => {
      polygon.forEach((ring) => rings.push(ring));
    });
  }
  return rings;
}

/** Convert a ring of [lon, lat] to an SVG path "d" attribute. */
function ringToPath(ring, width, height) {
  if (!ring || ring.length < 3) return "";
  let d = "";
  let first = true;
  for (const [lon, lat] of ring) {
    const [x, y] = projectPoint(lon, lat, width, height);
    if (first) {
      d += `M${x.toFixed(1)},${y.toFixed(1)}`;
      first = false;
    } else {
      d += `L${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  d += "Z";
  return d;
}

/** Simplify a ring by dropping points closer than `tolerance` (degrees). */
function simplifyRing(ring, tolerance = 0.15) {
  if (!ring || ring.length <= 2) return ring;
  const out = [ring[0]];
  let last = ring[0];
  for (let i = 1; i < ring.length; i++) {
    const p = ring[i];
    const dx = p[0] - last[0];
    const dy = p[1] - last[1];
    if (dx * dx + dy * dy >= tolerance * tolerance) {
      out.push(p);
      last = p;
    }
  }
  // keep closing point distinct from first if shape is large
  if (out.length > 2) {
    const first = out[0];
    const lastP = out[out.length - 1];
    const dx = lastP[0] - first[0];
    const dy = lastP[1] - first[1];
    if (dx * dx + dy * dy < tolerance * tolerance * 0.25) out.pop();
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main loader
// ---------------------------------------------------------------------------

export class WorldGeoLoader {
  constructor() {
    this._cache = null; // { paths: Map<iso3, string>, count, source }
    this._error = null;
  }

  /** Width/height the map is rendered at (used for projection). */
  setCanvasSize(width, height) {
    this._width = width;
    this._height = height;
    this._cache = null; // paths depend on size -> recompute
  }

  get error() {
    return this._error;
  }

  get loaded() {
    return !!this._cache;
  }

  /**
   * Fetch + parse world GeoJSON. Returns { paths: Map<iso3, pathString>, count }.
   * Falls back to built-in outline if everything fails.
   */
  async load() {
    if (this._cache) return this._cache;

    const width = this._width || 1000;
    const height = this._height || 500;

    let geojson = null;
    let source = null;
    let lastErr = null;

    for (const url of GEOJSON_SOURCES) {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        geojson = JSON.parse(text);
        source = url;
        break;
      } catch (err) {
        lastErr = err;
        // continue to next source
      }
    }

    if (!geojson) {
      // All remote sources failed -> use built-in fallback outline
      geojson = FALLBACK_WORLD;
      source = "builtin-fallback";
      this._error = new Error(
        `Unable to load world map geometry (${lastErr && lastErr.message}). `
        + "Showing a simplified world outline. Country shapes may be limited."
      );
    }

    const paths = new Map();
    let matched = 0;

    for (const feature of geojson.features || []) {
      const iso3 = feature.id;
      if (!iso3) continue;
      const country = BY_ISO3.get(iso3);
      if (!country) continue;

      const rings = extractRings(feature.geometry || {});
      const parts = rings
        .map((ring) => ringToPath(simplifyRing(ring, 0.12), width, height))
        .filter(Boolean);

      if (parts.length > 0) {
        paths.set(iso3, parts.join(" "));
        matched++;
      }
    }

    this._cache = {
      paths,
      count: matched,
      total: TOTAL_COUNTRIES,
      source,
      geojson,
    };
    return this._cache;
  }

  /** Reset cache + error so a retry can be attempted. */
  reset() {
    this._cache = null;
    this._error = null;
  }
}

export const worldGeoLoader = new WorldGeoLoader();

export default worldGeoLoader;
