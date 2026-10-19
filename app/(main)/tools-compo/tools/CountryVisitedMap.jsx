"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/app/theme-context";
import ToolPageShell from "../ToolPageShell";
import {
  COUNTRIES,
  TOTAL_COUNTRIES,
  REGIONS,
  BY_ISO2,
  normalizeVisited,
  serializeVisited,
} from "@/lib/countries";
import {
  worldGeoLoader,
  projectPoint,
  MAP_ASPECT_RATIO,
  MAP_LAT_TOP,
  MAP_LAT_BOTTOM,
} from "@/lib/world-geo";
import CountryFlag from "react-country-flag";
import copy from "clipboard-copy";
import {
  Globe,
  Share2,
  Download,
  Save,
  RefreshCw,
  Search,
  Check,
  ChevronLeft,
  AlertCircle,
  FileText,
  Upload,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ImageDown,
  Image as ImageIcon,
  Code2,
  ArrowUpRightFromSquare,
  X,
  Palette,
  Link2,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Sparkles,
  Droplet,
  Ruler,
  User,
  Grid3x3,
  Scan,
  Trash2,
  LayoutGrid,
  Shuffle,
  CheckCheck,
  Eraser,
  Camera,
  UploadCloud,
  ImagePlus,
  UserRound,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "toolstrek:visited-countries";
const SETTINGS_KEY = "toolstrek:visited-countries:settings";
const MAP_INTERNAL_W = 1200;
// Height follows the cropped projection bounds so the SVG viewBox matches the
// map's true aspect ratio (no letterboxing, no cut-off edges).
const MAP_INTERNAL_H = Math.round(MAP_INTERNAL_W / MAP_ASPECT_RATIO);

const BRAND_ORANGE = "#f97316";
const BRAND_ORANGE_DARK = "#ea580c";
const SITE_NAME = "ToolsTrek";

const DEFAULT_SETTINGS = {
  visitedColor: "#2563eb",
  unvisitedColor: "#e2e8f0",
  borderColor: "#cbd5e1",
  oceanColor: "",
  borderWidth: 0.5,
  unvisitedOpacity: 1,
  showBorders: true,
  showNames: true,
  showGraticule: false,
  showPercent: true,
  showLegend: true,
  highlightVisited: true,
  cardName: "",
  cardShowStats: true,
  cardShowProgress: true,
  cardShowAvatar: true,
  // Profile photo: { src: dataURL, zoom, offsetX, offsetY } or null.
  avatar: null,
};

// One-click colour themes. Each preset sets the full palette at once.
const MAP_PRESETS = [
  {
    id: "classic",
    label: "Classic Blue",
    visited: "#2563eb",
    unvisited: "#e2e8f0",
    border: "#cbd5e1",
    ocean: "",
  },
  {
    id: "sky",
    label: "Sky",
    visited: "#0ea5e9",
    unvisited: "#dbeafe",
    border: "#93c5fd",
    ocean: "#f0f9ff",
  },
  {
    id: "sunset",
    label: "Sunset",
    visited: "#f97316",
    unvisited: "#ffe8d6",
    border: "#fdba74",
    ocean: "#fff7ed",
  },
  {
    id: "ember",
    label: "Ember",
    visited: "#ef4444",
    unvisited: "#fee2e2",
    border: "#fca5a5",
    ocean: "#fff5f5",
  },
  {
    id: "forest",
    label: "Forest",
    visited: "#16a34a",
    unvisited: "#dcfce7",
    border: "#86efac",
    ocean: "#f0fdf4",
  },
  {
    id: "violet",
    label: "Violet",
    visited: "#7c3aed",
    unvisited: "#ede9fe",
    border: "#c4b5fd",
    ocean: "#f5f3ff",
  },
  {
    id: "mono",
    label: "Mono",
    visited: "#334155",
    unvisited: "#e5e7eb",
    border: "#cbd5e1",
    ocean: "#f8fafc",
  },
  {
    id: "midnight",
    label: "Midnight",
    visited: "#22d3ee",
    unvisited: "#1e293b",
    border: "#0ea5e9",
    ocean: "#0b1220",
  },
];

const regionLabels = Object.fromEntries(REGIONS.map((r) => [r.id, r.label]));

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

function clampScale(value) {
  return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
}

/* ------------------------------------------------------------------ */
/*  Tiny helpers                                                      */
/* ------------------------------------------------------------------ */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/*  Profile photo helpers                                             */
/* ------------------------------------------------------------------ */

const AVATAR_MIN_ZOOM = 1;
const AVATAR_MAX_ZOOM = 3;
const AVATAR_SOURCE_MAX = 720; // px on the long edge, stored in localStorage
const AVATAR_MAX_FILE_MB = 15;
const AVATAR_BUTTON_SIZE = 44;

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Rect (in px) at which the source image must be drawn so it fills a
 * `size` x `size` square viewport using the given crop.
 *
 * Offsets are stored normalised (fraction of the viewport), which makes the
 * same crop render identically in the toolbar button (44px) and on the
 * exported card (132px).
 */
function avatarDrawRect(imgW, imgH, size, crop) {
  const zoom = clampNumber(
    Number(crop?.zoom) || 1,
    AVATAR_MIN_ZOOM,
    AVATAR_MAX_ZOOM,
  );
  const cover = Math.max(size / imgW, size / imgH);
  const scale = cover * zoom;
  const w = imgW * scale;
  const h = imgH * scale;
  const maxX = Math.max(0, (w - size) / 2);
  const maxY = Math.max(0, (h - size) / 2);
  const ox = clampNumber((Number(crop?.offsetX) || 0) * size, -maxX, maxX);
  const oy = clampNumber((Number(crop?.offsetY) || 0) * size, -maxY, maxY);
  return { x: (size - w) / 2 + ox, y: (size - h) / 2 + oy, w, h };
}

/** Keep a crop valid (image always covers the viewport) and normalised. */
function clampAvatarCrop(imgW, imgH, size, crop) {
  const zoom = clampNumber(
    Number(crop?.zoom) || 1,
    AVATAR_MIN_ZOOM,
    AVATAR_MAX_ZOOM,
  );
  const scale = Math.max(size / imgW, size / imgH) * zoom;
  const maxX = Math.max(0, (imgW * scale - size) / 2) / size;
  const maxY = Math.max(0, (imgH * scale - size) / 2) / size;
  return {
    zoom,
    offsetX: clampNumber(Number(crop?.offsetX) || 0, -maxX, maxX),
    offsetY: clampNumber(Number(crop?.offsetY) || 0, -maxY, maxY),
  };
}

const DEFAULT_AVATAR_CROP = { zoom: 1, offsetX: 0, offsetY: 0 };

/** Validate/normalise an avatar loaded from storage or an imported file. */
function normalizeAvatar(raw) {
  if (!raw || typeof raw !== "object") return null;
  const src = typeof raw.src === "string" ? raw.src : "";
  if (!src.startsWith("data:image/")) return null;
  return {
    src,
    zoom: clampNumber(Number(raw.zoom) || 1, AVATAR_MIN_ZOOM, AVATAR_MAX_ZOOM),
    // Offsets are clamped at draw/edit time, once the image size is known.
    offsetX: Number(raw.offsetX) || 0,
    offsetY: Number(raw.offsetY) || 0,
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That image could not be loaded."));
    img.src = src;
  });
}

/**
 * Read an uploaded file and return a downscaled JPEG data URL (small enough to
 * live comfortably in localStorage) plus its pixel dimensions.
 */
async function processAvatarFile(file) {
  if (!file) throw new Error("No photo selected.");
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, WebP or GIF).");
  }
  if (file.size > AVATAR_MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`That photo is larger than ${AVATAR_MAX_FILE_MB} MB.`);
  }

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImageElement(dataUrl);

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) throw new Error("That image has no readable pixels.");

  const scale = Math.min(1, AVATAR_SOURCE_MAX / Math.max(iw, ih));
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not supported");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Flatten onto white so transparent PNGs don't turn black in JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  let src = "";
  try {
    src = canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    throw new Error("That image could not be processed.");
  }
  if (!src.startsWith("data:image/")) {
    throw new Error("That image could not be processed.");
  }
  return { src, width: w, height: h };
}

/* ------------------------------------------------------------------ */
/*  SVG → PNG export                                                  */
/*  The map is a self-contained SVG, so we rasterise it directly.     */
/*  (We intentionally avoid html2canvas: it cannot parse the modern   */
/*  oklch/lab color functions that Tailwind emits, and throws.)       */
/* ------------------------------------------------------------------ */

function serializeMapSvg(svgEl, width, height) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  return new XMLSerializer().serializeToString(clone);
}

function svgToPngCanvas(
  svgEl,
  { width, height, scale = 2, background = "#ffffff" },
) {
  return new Promise((resolve, reject) => {
    let objectUrl = "";
    try {
      const xml = serializeMapSvg(svgEl, width, height);
      const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      objectUrl = URL.createObjectURL(blob);
    } catch (err) {
      reject(err);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D is not supported");
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to rasterise the map"));
    };
    img.src = objectUrl;
  });
}

/* ------------------------------------------------------------------ */
/*  Travel "photo card" builder                                       */
/*  Composes a shareable card on a canvas: header (optional name),    */
/*  the map, key stats, a progress bar and the site footer.           */
/* ------------------------------------------------------------------ */

function getSiteHost() {
  if (typeof window === "undefined") return "toolstrek.com";
  return window.location.host || "toolstrek.com";
}

// Brand slug used in download filenames (falls back to "toolstrek" locally).
function siteSlug() {
  if (typeof window === "undefined") return "toolstrek";
  const host = window.location.hostname.replace(/^www\./, "");
  if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return "toolstrek";
  }
  return slugifyName(host.split(".")[0]) || "toolstrek";
}

function slugifyName(value, max = 40) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

// Professional download filename:
//   visited-countries[-<their-name>]-map-<website>.<ext>
function buildExportFilename(ext, name) {
  const parts = ["visited-countries"];
  const nameSlug = slugifyName(name);
  if (nameSlug) parts.push(nameSlug);
  parts.push("map", siteSlug());
  return `${parts.join("-")}.${ext}`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, rr);
    return;
  }
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t}…`;
}

const CARD_FONT =
  "'Inter', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";

async function buildTravelCard({
  svgEl,
  name,
  websiteName = SITE_NAME,
  websiteUrl,
  visitedCount,
  total,
  percent,
  continentsVisited,
  continentTotal,
  theme,
  oceanColor,
  highlightVisited = true,
  showStats = true,
  showProgress = true,
  showAvatar = true,
  avatar = null,
  accentColor,
  scale = 2,
}) {
  const W = 1200;
  const H = 1143;
  const PAD = 80;
  const dark = theme === "dark";
  const accent = accentColor || BRAND_ORANGE;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not supported");
  ctx.scale(scale, scale);

  const textPrimary = dark ? "#f8fafc" : "#0f172a";
  const textMuted = dark ? "#94a3b8" : "#64748b";
  const cardBorder = dark ? "#23324f" : "#e2e8f0";
  const mapBg = oceanColor || (dark ? "#0b1220" : "#eef4fb");

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  if (dark) {
    bg.addColorStop(0, "#0b1220");
    bg.addColorStop(1, "#111c33");
  } else {
    bg.addColorStop(0, "#ffffff");
    bg.addColorStop(1, "#eef2f7");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 10);

  // Header
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // Profile photo (optional) — drawn as a circle to the left of the header.
  const AV = 132;
  const AV_Y = 78;
  let avatarImg = null;
  if (showAvatar !== false && avatar && avatar.src) {
    try {
      avatarImg = await loadImageElement(avatar.src);
    } catch {
      avatarImg = null; // never fail the whole export over a photo
    }
  }
  if (avatarImg) {
    const radius = AV / 2;
    const cx = PAD + radius;
    const cy = AV_Y + radius;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const r = avatarDrawRect(
      avatarImg.naturalWidth || avatarImg.width,
      avatarImg.naturalHeight || avatarImg.height,
      AV,
      avatar,
    );
    ctx.drawImage(avatarImg, PAD + r.x, AV_Y + r.y, r.w, r.h);
    ctx.restore();

    // Ring around the circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = accent;
    ctx.stroke();
  }

  const textX = avatarImg ? PAD + AV + 36 : PAD;
  const textW = W - PAD - textX;

  ctx.fillStyle = accent;
  ctx.font = `700 22px ${CARD_FONT}`;
  ctx.fillText("MY VISITED COUNTRIES MAP", textX, 112);

  ctx.fillStyle = textPrimary;
  ctx.font = `800 58px ${CARD_FONT}`;
  const title = name && name.trim() ? name.trim() : "My Travel Map";
  ctx.fillText(fitText(ctx, title, textW), textX, 188);

  ctx.fillStyle = textMuted;
  ctx.font = `400 25px ${CARD_FONT}`;
  ctx.fillText(
    fitText(ctx, "Every country I've explored so far", textW),
    textX,
    230,
  );

  // Map panel
  const mapX = PAD;
  const mapY = 280;
  const mapW = W - PAD * 2;
  const mapH = Math.round(mapW / MAP_ASPECT_RATIO);
  roundRectPath(ctx, mapX, mapY, mapW, mapH, 26);
  ctx.fillStyle = mapBg;
  ctx.fill();

  ctx.save();
  roundRectPath(ctx, mapX, mapY, mapW, mapH, 26);
  ctx.clip();
  const mapCanvas = await svgToPngCanvas(svgEl, {
    width: MAP_INTERNAL_W,
    height: MAP_INTERNAL_H,
    scale: 2,
    background: "transparent",
  });
  ctx.drawImage(mapCanvas, mapX, mapY, mapW, mapH);
  ctx.restore();

  roundRectPath(ctx, mapX, mapY, mapW, mapH, 26);
  ctx.lineWidth = 2;
  ctx.strokeStyle = cardBorder;
  ctx.stroke();

  // Stats
  const statsY = mapY + mapH + 96;
  if (showStats !== false) {
    const cols = [
      { value: String(visitedCount), label: "COUNTRIES VISITED" },
      { value: `${percent}%`, label: "OF THE WORLD" },
      {
        value: `${continentsVisited}`,
        label: `OF ${continentTotal} CONTINENTS`,
      },
    ];
    const colW = (W - PAD * 2) / cols.length;
    cols.forEach((c, i) => {
      const cx = PAD + colW * i + colW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = accent;
      ctx.font = `800 54px ${CARD_FONT}`;
      ctx.fillText(c.value, cx, statsY);
      ctx.fillStyle = textMuted;
      ctx.font = `600 19px ${CARD_FONT}`;
      ctx.fillText(c.label, cx, statsY + 38);
    });
    ctx.textAlign = "left";
  }

  // Progress bar
  const barY = statsY + 78;
  if (showProgress !== false) {
    const barW = W - PAD * 2;
    const barH = 16;
    const pct = Math.min(Math.max(percent, 0), 100);
    roundRectPath(ctx, PAD, barY, barW, barH, barH / 2);
    ctx.fillStyle = dark ? "#1e293b" : "#e2e8f0";
    ctx.fill();
    roundRectPath(
      ctx,
      PAD,
      barY,
      Math.max(barH, (barW * pct) / 100),
      barH,
      barH / 2,
    );
    ctx.fillStyle = accent;
    ctx.fill();
  }

  ctx.fillStyle = textMuted;
  ctx.font = `400 24px ${CARD_FONT}`;
  ctx.fillText(
    `${Math.max(total - visitedCount, 0)} of ${total} countries still to explore`,
    PAD,
    showProgress !== false ? barY + 68 : barY + 10,
  );

  // Footer
  const dividerY = H - 120;
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, dividerY);
  ctx.lineTo(W - PAD, dividerY);
  ctx.stroke();

  ctx.fillStyle = textPrimary;
  ctx.font = `800 32px ${CARD_FONT}`;
  ctx.fillText(websiteName, PAD, H - 58);
  ctx.textAlign = "right";
  ctx.fillStyle = accent;
  ctx.font = `600 25px ${CARD_FONT}`;
  ctx.fillText(websiteUrl || getSiteHost(), W - PAD, H - 58);
  ctx.textAlign = "left";

  return canvas;
}

/* ------------------------------------------------------------------ */
/*  Flag badge                                                        */
/* ------------------------------------------------------------------ */

function FlagBadge({ iso2, className = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        "inline-flex h-4 w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-muted text-[8px] font-bold uppercase text-muted-foreground ring-1 ring-black/10 dark:ring-white/20",
        className,
      )}
      title={iso2}
      aria-hidden="true"
      suppressHydrationWarning
    >
      {failed ? (
        iso2
      ) : (
        <CountryFlag
          countryCode={iso2}
          svg
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

/* ================================================================== */
/*  Main component                                                    */
/* ================================================================== */

export default function CountryVisitedMap() {
  const { theme } = useTheme();

  // ---------- refs ----------
  const mountedRef = useRef(false);
  const mapContainerRef = useRef(null);
  const mapImageRef = useRef(null);
  const fileInputRef = useRef(null);
  const tooltipRef = useRef(null);
  const tooltipTimer = useRef(null);
  // Latest serialized visited string we actually wrote to storage. Used so the
  // very first effect run (before saved data is applied on mount) can never
  // overwrite the user's saved progress with an empty value.
  const lastPersistedRef = useRef("");
  // Live size of the map viewport (kept fresh by a ResizeObserver) so pan/zoom
  // can be clamped without measuring layout on every pointer move.
  const sizeRef = useRef({ w: 0, h: 0 });

  // ---------- state ----------
  // Initialize as empty Set on both server & client to avoid hydration mismatch.
  // Saved progress is loaded from localStorage + URL params after mount below.
  const [visited, setVisited] = useState(new Set());
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [geoError, setGeoError] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  // Always-current settings (refs stay in sync so persistence never writes a
  // stale/default object before the saved values have been applied on mount).
  const settingsRef = useRef(settings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerOrder, setPickerOrder] = useState([]);
  const [pickerKey, setPickerKey] = useState(0);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  // SVG pan/zoom view state.
  const [svgTransform, setSvgTransform] = useState({ scale: 1, tx: 0, ty: 0 });

  // Clamp pan/zoom so the map can never be dragged out of view. When the map
  // fits inside the viewport it is always centred. Works for any viewport shape
  // (including fullscreen, where the 2:1 map is letterboxed).
  const clampTransform = useCallback((t) => {
    const scale = clampScale(t.scale);
    const { w, h } = sizeRef.current;
    if (!w || !h) return { scale, tx: t.tx, ty: t.ty };
    const ar = MAP_INTERNAL_W / MAP_INTERNAL_H;
    const contentW = Math.min(w, h * ar);
    const contentH = contentW / ar;
    const clampAxis = (v, size, content) => {
      const scaled = scale * content;
      if (scaled <= size) return 0;
      const max = (scaled - size) / 2;
      return Math.min(max, Math.max(-max, v));
    };
    return {
      scale,
      tx: clampAxis(t.tx, w, contentW),
      ty: clampAxis(t.ty, h, contentH),
    };
  }, []);

  // ---------- derived ----------
  const visitedCount = visited.size;
  const unvisitedCount = TOTAL_COUNTRIES - visitedCount;
  const percent = TOTAL_COUNTRIES
    ? Math.round((visitedCount / TOTAL_COUNTRIES) * 100)
    : 0;

  // Per-continent breakdown
  const continentStats = useMemo(() => {
    const stats = {};
    for (const r of REGIONS) {
      const regionCountries = COUNTRIES.filter((c) => c.region === r.id);
      const visitedInRegion = regionCountries.filter((c) =>
        visited.has(c.iso2),
      ).length;
      stats[r.id] = {
        total: regionCountries.length,
        visited: visitedInRegion,
        percent:
          regionCountries.length > 0
            ? Math.round((visitedInRegion / regionCountries.length) * 100)
            : 0,
      };
    }
    return stats;
  }, [visited]);

  const visitedContinents = Object.values(continentStats).filter(
    (s) => s.visited > 0,
  ).length;

  // ---------- tooltip ----------
  const showTooltip = useCallback((content, x, y) => {
    const el = tooltipRef.current;
    if (!el) return;
    clearTimeout(tooltipTimer.current);
    el.innerHTML = content;
    el.style.display = "block";
    el.style.left = `${x + 14}px`;
    el.style.top = `${y + 14}px`;
  }, []);

  const hideTooltip = useCallback(() => {
    const el = tooltipRef.current;
    if (!el) return;
    tooltipTimer.current = window.setTimeout(() => {
      el.style.display = "none";
    }, 120);
  }, []);

  // ---------- mount tracking + load saved state ----------
  useEffect(() => {
    mountedRef.current = true;
    // Load saved visited countries from localStorage / URL params after mount
    // so the initial server & client renders match (no hydration mismatch).
    try {
      let initial = [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) initial = raw.split(",").filter(Boolean);
      if (!initial.length) {
        const params = new URLSearchParams(window.location.search);
        const v = params.get("visited");
        if (v) initial = v.split(",");
      }
      if (initial.length) {
        // Intentional: load saved state after mount to avoid hydration mismatch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisited(normalizeVisited(initial.join(",")));
      }
    } catch {
      // localStorage / URL unavailable -> memory only
    }
    // Restore saved customisation (colors, card name, toggles) after mount.
    try {
      const rawSettings = localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        // Never trust stored/imported shapes for the photo.
        merged.avatar = normalizeAvatar(merged.avatar);
        settingsRef.current = merged;
        setSettings(merged);
      }
    } catch {
      // ignore corrupt settings
    }
  }, []);

  // ---------- persist + sync URL whenever visited changes ----------
  useEffect(() => {
    if (!mountedRef.current) return;
    const codes = serializeVisited(visited);
    // Skip the first run (before saved progress has been applied on mount) so
    // we never clobber stored data with the initial empty set.
    if (lastPersistedRef.current === codes) return;
    lastPersistedRef.current = codes;
    try {
      localStorage.setItem(STORAGE_KEY, codes);
    } catch {
      // localStorage unavailable -> memory only
    }
    try {
      const params = new URLSearchParams(window.location.search);
      if (codes) params.set("visited", codes);
      else params.delete("visited");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}`,
      );
    } catch {
      // non-fatal
    }
  }, [visited]);

  // ---------- load world geometry (retryable) ----------
  const loadWorld = useCallback(async () => {
    setLoadingGeo(true);
    setGeoError(null);
    try {
      worldGeoLoader.reset();
      worldGeoLoader.setCanvasSize(MAP_INTERNAL_W, MAP_INTERNAL_H);
      const data = await worldGeoLoader.load();
      if (!mountedRef.current) return;
      setMapData(data);
      const empty = !data?.paths || data.paths.size === 0;
      if (empty) {
        setGeoError(
          "We couldn't load the country outlines. Please check your connection and try again.",
        );
      } else if (data.source === "builtin-fallback" && worldGeoLoader.error) {
        setGeoError(
          "We loaded a simplified map because the full country data couldn't be reached.",
        );
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setGeoError(
        err instanceof Error
          ? err.message
          : "Failed to load the world map. Please try again.",
      );
      setMapData(null);
    } finally {
      if (mountedRef.current) setLoadingGeo(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Run the loader asynchronously so mounting never sets state synchronously.
    (async () => {
      await loadWorld();
    })();
    return () => {
      mountedRef.current = false;
    };
  }, [loadWorld]);

  // Keep the map viewport size fresh (used to clamp pan/zoom) and re-centre the
  // map whenever the container is resized, so it always stays fully in view.
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      sizeRef.current = { w: box.width, h: box.height };
      setSvgTransform((prev) => clampTransform(prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [clampTransform]);

  // ---------- handlers ----------
  const toggleCountry = useCallback((iso2) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(iso2)) next.delete(iso2);
      else next.add(iso2);
      return next;
    });
  }, []);

  const setCountryVisited = useCallback((iso2, checked) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (checked) next.add(iso2);
      else next.delete(iso2);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setVisited(new Set(COUNTRIES.map((c) => c.iso2)));
    toast("All countries marked as visited", {
      description: "Your world map has been updated.",
    });
  }, []);

  // Open the country picker with a freshly shuffled browsing order.
  const openPicker = useCallback(() => {
    setPickerOrder(shuffleArray(COUNTRIES.map((c) => c.iso2)));
    setPickerKey((k) => k + 1);
    setPickerOpen(true);
  }, []);

  // Open the profile-photo editor (remounts so it starts from the saved crop).
  const openAvatar = useCallback(() => {
    setAvatarKey((k) => k + 1);
    setAvatarOpen(true);
  }, []);

  const clearAll = useCallback(() => {
    setVisited(new Set());
    toast("Map cleared", {
      description: "All countries unmarked.",
    });
  }, []);

  const resetMap = useCallback(() => {
    setVisited(new Set());
    toast("Map reset", {
      description: "All progress removed.",
    });
  }, []);

  const updateSettings = useCallback((next) => {
    const merged = { ...settingsRef.current, ...next };
    settingsRef.current = merged;
    let persisted = true;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    } catch {
      // localStorage unavailable or full -> keep it in memory for this session
      persisted = false;
    }
    setSettings(merged);
    return persisted;
  }, []);

  const saveAvatar = useCallback(
    (next) => {
      const persisted = updateSettings({ avatar: normalizeAvatar(next) });
      setAvatarOpen(false);
      if (!persisted) {
        toast.error("Photo set for this session only", {
          description:
            "Your browser storage is full, so the photo could not be saved permanently.",
        });
        return;
      }
      toast("Profile photo saved", {
        description: "It will appear on your next exported card.",
      });
    },
    [updateSettings],
  );

  const removeAvatar = useCallback(() => {
    updateSettings({ avatar: null });
    setAvatarOpen(false);
    toast("Profile photo removed", {
      description: "Your card will export without a photo.",
    });
  }, [updateSettings]);

  // Wipe everything this tool stores: visited countries, settings and the URL.
  const resetAllData = useCallback(() => {
    setResetOpen(false);
    setVisited(new Set());
    lastPersistedRef.current = "";
    const defaults = { ...DEFAULT_SETTINGS };
    settingsRef.current = defaults;
    setSettings(defaults);
    setSvgTransform({ scale: 1, tx: 0, ty: 0 });
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch {
      // ignore
    }
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      // ignore
    }
    toast("All data reset", {
      description: "Your map, saved progress and settings were cleared.",
    });
  }, []);

  // ---------- share / export ----------
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    const codes = serializeVisited(visited);
    if (codes) params.set("visited", codes);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [visited]);

  const copyShareLink = useCallback(async () => {
    try {
      await copy(shareUrl);
      toast("Link copied to clipboard", {
        description: "Share your visited countries map.",
      });
    } catch {
      toast.error("Failed to copy link", {
        description: "Copy the URL manually.",
      });
    }
  }, [shareUrl]);

  const shareText = useMemo(() => {
    const noun = visitedCount === 1 ? "country" : "countries";
    return `I've visited ${visitedCount} ${noun} — that's ${percent}% of the world! 🌍 Check out my travel map:`;
  }, [visitedCount, percent]);

  const shareTo = useCallback(
    (network) => {
      const url = shareUrl;
      const text = shareText;
      let target = "";
      switch (network) {
        case "twitter":
          target = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text,
          )}&url=${encodeURIComponent(url)}`;
          break;
        case "facebook":
          target = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url,
          )}`;
          break;
        case "linkedin":
          target = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url,
          )}`;
          break;
        case "whatsapp":
          target = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
          break;
        case "email":
          target = `mailto:?subject=${encodeURIComponent(
            "My visited countries map",
          )}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
          break;
        default:
          return;
      }
      window.open(target, "_blank", "noopener,noreferrer");
    },
    [shareUrl, shareText],
  );

  const saveCanvasAsPng = useCallback((canvas, filename) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const downloadPng = useCallback(async () => {
    const svgEl = mapImageRef.current?.querySelector("svg");
    if (!svgEl) {
      toast.error("Export unavailable", {
        description: "The map is still loading. Please try again.",
      });
      return;
    }
    try {
      setExporting(true);
      const canvas = await svgToPngCanvas(svgEl, {
        width: MAP_INTERNAL_W,
        height: MAP_INTERNAL_H,
        scale: 2,
        background:
          settings.oceanColor || (theme === "dark" ? "#0b1220" : "#ffffff"),
      });
      saveCanvasAsPng(canvas, buildExportFilename("png", settings.cardName));
      toast("Map exported", {
        description: "Your travel map was saved as a PNG image.",
      });
    } catch (err) {
      toast.error("Export failed", {
        description: "Could not generate the map image.",
      });
      console.error("PNG export error:", err);
    } finally {
      setExporting(false);
    }
  }, [theme, settings.oceanColor, settings.cardName, saveCanvasAsPng]);

  const downloadCard = useCallback(async () => {
    const svgEl = mapImageRef.current?.querySelector("svg");
    if (!svgEl) {
      toast.error("Export unavailable", {
        description: "The map is still loading. Please try again.",
      });
      return;
    }
    try {
      setExporting(true);
      const canvas = await buildTravelCard({
        svgEl,
        name: settings.cardName,
        websiteName: SITE_NAME,
        websiteUrl: getSiteHost(),
        visitedCount,
        total: TOTAL_COUNTRIES,
        percent,
        continentsVisited: visitedContinents,
        continentTotal: REGIONS.length,
        theme,
        oceanColor: settings.oceanColor,
        highlightVisited: settings.highlightVisited,
        showStats: settings.cardShowStats,
        showProgress: settings.cardShowProgress,
        showAvatar: settings.cardShowAvatar,
        avatar: settings.avatar,
        accentColor: settings.visitedColor,
        scale: 2,
      });
      saveCanvasAsPng(canvas, buildExportFilename("png", settings.cardName));
      toast("Photo card exported", {
        description: "A shareable travel card was saved as a PNG.",
      });
    } catch (err) {
      toast.error("Export failed", {
        description: "Could not generate the photo card.",
      });
      console.error("Card export error:", err);
    } finally {
      setExporting(false);
    }
  }, [
    theme,
    settings,
    visitedCount,
    percent,
    visitedContinents,
    saveCanvasAsPng,
  ]);

  const downloadList = useCallback(() => {
    const lines = ["Country,ISO-2,ISO-3,Region,Visited"];
    for (const c of COUNTRIES) {
      lines.push(
        [
          `"${c.name}"`,
          c.iso2,
          c.iso3,
          regionLabels[c.region] || c.region,
          visited.has(c.iso2) ? "Yes" : "No",
        ].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = buildExportFilename("csv", settings.cardName);
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast("Visited list exported", {
      description: "CSV file downloaded.",
    });
  }, [visited, settings.cardName]);

  const exportJson = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      tool: "visited-countries-map",
      version: 1,
      visited: serializeVisited(visited),
      count: visitedCount,
      total: TOTAL_COUNTRIES,
      percent,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = buildExportFilename("json", settings.cardName);
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast("Map exported to JSON", {
      description: "Settings and visited countries saved.",
    });
  }, [visited, visitedCount, percent, settings]);

  const handleImport = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please import a JSON file smaller than 5 MB.",
        });
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => {
        toast.error("Could not read the file", {
          description: "Please try again with a valid JSON export.",
        });
      };
      reader.onload = (ev) => {
        try {
          const text = ev.target.result;
          const parsed = JSON.parse(text);
          let codes = [];
          if (Array.isArray(parsed.visited)) codes = parsed.visited;
          else if (Array.isArray(parsed.codes)) codes = parsed.codes;
          else if (typeof parsed.visited === "string")
            codes = parsed.visited.split(",");
          else throw new Error("Invalid file: no visited countries found.");
          const next = normalizeVisited(codes.join(","));
          setVisited(next);
          if (parsed.settings && typeof parsed.settings === "object") {
            updateSettings({
              ...parsed.settings,
              avatar: normalizeAvatar(parsed.settings.avatar),
            });
          }
          toast("Map imported", {
            description: `${next.size} country(ies) restored.`,
          });
        } catch (err) {
          toast.error("Import failed", {
            description:
              err instanceof Error
                ? err.message
                : "Upload a valid exported JSON file.",
          });
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [updateSettings],
  );

  // ---------- embed code ----------
  const embedCode = useMemo(() => {
    const codes = serializeVisited(visited);
    if (typeof window === "undefined") return "";
    const src = `${window.location.origin}${window.location.pathname}?${
      codes ? `visited=${codes}` : ""
    }`;
    return `<iframe src="${src}" width="100%" height="600" style="border:none; border-radius:12px; overflow:hidden;" loading="lazy" allowfullscreen></iframe>`;
  }, [visited]);

  const copyEmbedCode = useCallback(async () => {
    try {
      await copy(embedCode);
      toast("Embed code copied", {
        description: "Paste it into your blog or website.",
      });
    } catch {
      toast.error("Failed to copy embed code");
    }
  }, [embedCode]);

  // ---------- render country path ----------
  const renderCountryPath = useCallback(
    (iso2) => {
      const country = BY_ISO2.get(iso2);
      if (!country || !mapData?.paths) return null;
      const path = mapData.paths.get(country.iso3);
      if (!path) return null;
      const isVisited = visited.has(iso2);

      return (
        <path
          key={iso2}
          data-iso={iso2}
          d={path}
          fill={
            isVisited && settings.highlightVisited
              ? settings.visitedColor
              : settings.unvisitedColor
          }
          stroke={settings.showBorders ? settings.borderColor : "none"}
          strokeWidth={settings.showBorders ? settings.borderWidth : 0}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          fillOpacity={
            isVisited
              ? 1
              : settings.unvisitedColor === "transparent"
                ? 0
                : Number(settings.unvisitedOpacity ?? 1)
          }
          className="cursor-pointer transition-colors duration-200"
          onMouseEnter={(e) => {
            if (!settings.showNames) return;
            const label = isVisited ? `✓ ${country.name}` : country.name;
            showTooltip(label, e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (!settings.showNames) return;
            const label = isVisited ? `✓ ${country.name}` : country.name;
            showTooltip(label, e.clientX, e.clientY);
          }}
          onMouseLeave={hideTooltip}
        />
      );
    },
    [visited, mapData, settings, showTooltip, hideTooltip],
  );

  const renderGraticule = useCallback(() => {
    if (!settings.showGraticule) return null;
    const lines = [];
    for (let lon = -180; lon <= 180; lon += 30) {
      const [x1, y1] = projectPoint(
        lon,
        MAP_LAT_TOP,
        MAP_INTERNAL_W,
        MAP_INTERNAL_H,
      );
      const [x2, y2] = projectPoint(
        lon,
        MAP_LAT_BOTTOM,
        MAP_INTERNAL_W,
        MAP_INTERNAL_H,
      );
      lines.push(
        <line
          key={`v-${lon}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#cbd5e1"
          strokeWidth="0.5"
          opacity={theme === "dark" ? 0.25 : 0.45}
        />,
      );
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const [x1, y1] = projectPoint(-180, lat, MAP_INTERNAL_W, MAP_INTERNAL_H);
      const [x2, y2] = projectPoint(180, lat, MAP_INTERNAL_W, MAP_INTERNAL_H);
      lines.push(
        <line
          key={`h-${lat}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#cbd5e1"
          strokeWidth="0.5"
          opacity={theme === "dark" ? 0.25 : 0.45}
        />,
      );
    }
    return <g className="graticule">{lines}</g>;
  }, [settings.showGraticule, theme]);

  const renderEmptyMap = () => (
    <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card dark:bg-input p-6 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          World map unavailable
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {geoError ||
            "We couldn't load the country outlines. Check your connection and try again."}
        </p>
      </div>
      <button
        type="button"
        onClick={loadWorld}
        disabled={loadingGeo}
        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-semibold text-orange-50 transition hover:bg-orange-600 disabled:opacity-50"
      >
        <RefreshCw
          className={cn("h-3.5 w-3.5", loadingGeo && "animate-spin")}
        />
        {loadingGeo ? "Retrying…" : "Retry loading map"}
      </button>
    </div>
  );

  // ---------- SVG pan/zoom ----------
  const panStartRef = useRef(null); // pointer position when the gesture began
  const didPanRef = useRef(false); // true once the pointer has actually dragged

  // Zoom keeping the point (localX, localY — relative to the map viewport)
  // anchored. The SVG scales around its centre, so the anchor maths accounts for
  // that origin.
  const zoomAt = useCallback(
    (localX, localY, resolveScale) => {
      setSvgTransform((prev) => {
        const scale = clampScale(resolveScale(prev.scale));
        const ratio = scale / prev.scale;
        const { w, h } = sizeRef.current;
        const ox = w / 2;
        const oy = h / 2;
        return clampTransform({
          scale,
          tx: ratio * prev.tx + (1 - ratio) * (localX - ox),
          ty: ratio * prev.ty + (1 - ratio) * (localY - oy),
        });
      });
    },
    [clampTransform],
  );

  // Only begin panning after a small movement threshold, so a plain click still
  // reaches the country <path> underneath and toggles it. Pointer capture is
  // deferred until drag starts so it never swallows the click event.
  const handlePointerDown = useCallback((e) => {
    if (typeof e.button === "number" && e.button !== 0) return;
    didPanRef.current = false;
    panStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const start = panStartRef.current;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!didPanRef.current && Math.hypot(dx, dy) < 4) return;
      if (!didPanRef.current) {
        didPanRef.current = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // pointer capture unsupported -> drag still works inside the map
        }
      }
      setSvgTransform((prev) =>
        clampTransform({
          scale: prev.scale,
          tx: prev.tx + dx,
          ty: prev.ty + dy,
        }),
      );
      panStartRef.current = { x: e.clientX, y: e.clientY };
    },
    [clampTransform],
  );

  const handlePointerUp = useCallback((e) => {
    if (didPanRef.current) {
      // Keep didPanRef set so the click fired after a drag is ignored; it is
      // reset on the next pointer down.
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    panStartRef.current = null;
  }, []);

  // Country selection runs at the SVG level so a simple click always registers,
  // while a drag (which sets pointer capture) is ignored.
  const handleMapClick = useCallback(
    (e) => {
      if (didPanRef.current) return;
      const iso2 = e.target?.getAttribute?.("data-iso");
      if (!iso2) return;
      toggleCountry(iso2);
    },
    [toggleCountry],
  );

  const resetView = useCallback(() => {
    setSvgTransform(clampTransform({ scale: 1, tx: 0, ty: 0 }));
  }, [clampTransform]);

  const zoomBy = useCallback(
    (factor, anchor) => {
      const el = mapContainerRef.current;
      const rect = el ? el.getBoundingClientRect() : null;
      const cx =
        anchor && rect ? anchor.x - rect.left : rect ? rect.width / 2 : 0;
      const cy =
        anchor && rect ? anchor.y - rect.top : rect ? rect.height / 2 : 0;
      zoomAt(cx, cy, (s) => s * factor);
    },
    [zoomAt],
  );

  const zoomIn = useCallback(() => zoomBy(1.25), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(0.8), [zoomBy]);
  const fitView = useCallback(() => resetView(), [resetView]);

  const toggleFullscreen = useCallback(async () => {
    const el = mapContainerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      toast.error("Fullscreen unavailable", {
        description: "Your browser blocked the fullscreen request.",
      });
    }
  }, []);

  // Keep the UI in sync when fullscreen is toggled with Esc / F11 / etc.
  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const atMaxZoom = svgTransform.scale >= MAX_SCALE - 1e-6;
  const atMinZoom = svgTransform.scale <= MIN_SCALE + 1e-6;
  const isDefaultView =
    Math.abs(svgTransform.scale - 1) < 1e-6 &&
    Math.abs(svgTransform.tx) < 0.5 &&
    Math.abs(svgTransform.ty) < 0.5;
  const zoomPercent = Math.round(svgTransform.scale * 100);

  return (
    <div className="min-h-[60vh] text-gray-900 dark:text-slate-100 transition-colors duration-300 relative">
      <Toaster position="bottom-right" richColors />
      <ToolPageShell widthClassName="max-w-[1000px] px-4 pt-12 pb-20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-orange-600 uppercase bg-orange-50 dark:bg-orange-900/20 mb-3">
            <Globe className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Travel Tracker</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-slate-100 tracking-tight">
            Visited Countries Map
          </h1>
          <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
            Mark every country you&apos;ve been to, see what % of the world
            you&apos;ve explored, and build a shareable travel map you can keep
            updating.
          </p>
        </div>

        {/* Top action bar — photo, name, then Search + Customize / Reset / Export / Share */}
        <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
          {/* Profile photo + name (the name field is the widest) */}
          <div className="flex w-full items-center gap-2 lg:flex-[2]">
            <AvatarButton avatar={settings.avatar} onClick={openAvatar} />
            <div className="relative min-w-0 flex-1">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={settings.cardName}
                maxLength={40}
                onChange={(e) => updateSettings({ cardName: e.target.value })}
                placeholder="Your name"
                aria-label="Your name (shown on the exported card)"
                className="w-full rounded-xl border bg-input py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 dark:bg-slate-700"
              />
            </div>
          </div>

          {/* Search (compact) + actions — each stretches to fill the row */}
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-1 lg:items-center lg:gap-2">
            <CountrySearchButton
              compact
              onClick={openPicker}
              className="w-full lg:w-auto lg:flex-none"
            />

            <button
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-accent dark:bg-input dark:text-slate-200 dark:hover:bg-accent/50 lg:flex-1"
              title="Customize colors, card & more"
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span className="truncate">Customize</span>
            </button>

            <button
              onClick={() => setResetOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:bg-input dark:text-slate-200 lg:flex-1"
              title="Reset all saved data"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Reset</span>
            </button>

            <Menu
              align="right"
              className="w-full lg:flex-1"
              trigger={(open, toggle) => (
                <button
                  onClick={toggle}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-accent dark:bg-input dark:text-slate-200 dark:hover:bg-accent/50"
                  title="Export your map"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {exporting ? "Exporting…" : "Export"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 transition",
                      open && "rotate-180",
                    )}
                  />
                </button>
              )}
            >
              <MenuItem
                icon={<ImageDown className="w-4 h-4" />}
                label="Download photo card"
                hint="Branded, shareable PNG"
                onClick={downloadCard}
                disabled={exporting || loadingGeo || visitedCount === 0}
              />
              <MenuItem
                icon={<ImageIcon className="w-4 h-4" />}
                label="Download map only"
                hint="Plain PNG of the map"
                onClick={downloadPng}
                disabled={exporting || loadingGeo || visitedCount === 0}
              />
              <div className="my-1 h-px bg-border" />
              <MenuItem
                icon={<Save className="w-4 h-4" />}
                label="Export data (JSON)"
                onClick={exportJson}
              />
              <MenuItem
                icon={<FileText className="w-4 h-4" />}
                label="Download list (CSV)"
                onClick={downloadList}
              />
              <div className="my-1 h-px bg-border" />
              <MenuItem
                icon={<Code2 className="w-4 h-4" />}
                label="Embed code"
                onClick={() => setEmbedOpen(true)}
              />
              <MenuItem
                icon={<Upload className="w-4 h-4" />}
                label="Import data (JSON)"
                onClick={() => fileInputRef.current?.click()}
              />
            </Menu>

            <Menu
              align="right"
              className="col-span-2 w-full sm:col-span-1 lg:flex-1"
              trigger={(open, toggle) => (
                <button
                  onClick={toggle}
                  disabled={visitedCount === 0}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500 px-3 py-2 text-sm font-medium text-orange-50 shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Share your map"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Share</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 shrink-0 transition",
                      open && "rotate-180",
                    )}
                  />
                </button>
              )}
            >
              <MenuItem
                icon={<Link2 className="w-4 h-4" />}
                label="Copy link"
                onClick={copyShareLink}
              />
              <div className="my-1 h-px bg-border" />
              <MenuItem
                icon={<Twitter className="w-4 h-4" />}
                label="Share on X"
                onClick={() => shareTo("twitter")}
              />
              <MenuItem
                icon={<Facebook className="w-4 h-4" />}
                label="Share on Facebook"
                onClick={() => shareTo("facebook")}
              />
              <MenuItem
                icon={<Linkedin className="w-4 h-4" />}
                label="Share on LinkedIn"
                onClick={() => shareTo("linkedin")}
              />
              <MenuItem
                icon={<MessageCircle className="w-4 h-4" />}
                label="Share on WhatsApp"
                onClick={() => shareTo("whatsapp")}
              />
              <MenuItem
                icon={<Mail className="w-4 h-4" />}
                label="Share via email"
                onClick={() => shareTo("email")}
              />
            </Menu>
          </div>
        </div>

        {/* Hidden file input shared by the Export menu */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="sr-only"
        />

        {/* Non-blocking notice: simplified/partial map data */}
        {geoError && mapData && !loadingGeo && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{geoError}</p>
              <button
                type="button"
                onClick={loadWorld}
                disabled={loadingGeo}
                className="mt-1 text-xs font-semibold underline underline-offset-2 hover:no-underline disabled:opacity-50"
              >
                {loadingGeo ? "Reloading…" : "Reload full map data"}
              </button>
            </div>
          </div>
        )}

        {/* Main card: map + bottom stats */}
        <div className="rounded-2xl border border-border bg-card shadow-sm dark:bg-input overflow-hidden mb-10">
          <div
            ref={mapContainerRef}
            style={{
              ...(settings.oceanColor
                ? { backgroundColor: settings.oceanColor }
                : {}),
              // Match the frame to the map's true aspect so nothing is cropped.
              ...(fullscreen
                ? {}
                : { aspectRatio: String(MAP_INTERNAL_W / MAP_INTERNAL_H) }),
            }}
            className={cn(
              "relative w-full",
              fullscreen
                ? "h-screen bg-background dark:bg-slate-950"
                : "min-h-[220px] bg-background/30 dark:bg-slate-950/40",
            )}
          >
            {/* Map image — this wrapper is what gets captured for image export,
                so the on-screen controls are deliberately excluded. */}
            <div ref={mapImageRef} className="absolute inset-0 overflow-hidden">
              {!loadingGeo && mapData ? (
                <svg
                  viewBox={`0 0 ${MAP_INTERNAL_W} ${MAP_INTERNAL_H}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="block h-full w-full select-none"
                  style={{
                    transformOrigin: "50% 50%",
                    transform: `translate(${svgTransform.tx}px, ${svgTransform.ty}px) scale(${svgTransform.scale})`,
                    touchAction: svgTransform.scale > 1 ? "none" : "pan-y",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onClick={handleMapClick}
                >
                  {renderGraticule()}
                  {COUNTRIES.map((c) => renderCountryPath(c.iso2))}
                </svg>
              ) : null}
            </div>

            {/* Fullscreen toggle (top left) */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-3 left-3 z-20 rounded-xl border border-border bg-white/95 p-2.5 text-gray-700 shadow-sm backdrop-blur transition hover:bg-accent dark:bg-slate-800/95 dark:text-slate-200 dark:hover:bg-slate-700"
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>

            {/* Fullscreen search — find & mark countries without leaving */}
            {fullscreen && (
              <div className="absolute left-1/2 top-3 z-40 w-[min(360px,calc(100%-9rem))] -translate-x-1/2">
                <div className="rounded-xl border border-border bg-white/95 p-1.5 shadow-lg backdrop-blur dark:bg-slate-800/95">
                  <CountrySearchButton onClick={openPicker} />
                </div>
              </div>
            )}

            {/* Map controls (top right) */}
            <div className="absolute top-3 right-3 z-20 flex flex-col items-center overflow-hidden rounded-xl border border-border bg-white/95 shadow-sm backdrop-blur dark:bg-slate-800/95">
              <button
                onClick={zoomIn}
                disabled={atMaxZoom}
                className="p-2.5 text-gray-700 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="h-px w-full bg-border" aria-hidden="true" />
              <button
                onClick={zoomOut}
                disabled={atMinZoom}
                className="p-2.5 text-gray-700 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="h-px w-full bg-border" aria-hidden="true" />
              <button
                onClick={fitView}
                disabled={isDefaultView}
                className="p-2.5 text-gray-700 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Fit map to view"
                aria-label="Fit map to view"
              >
                <Scan className="w-4 h-4" />
              </button>
              <span className="h-px w-full bg-border" aria-hidden="true" />
              <button
                onClick={resetView}
                disabled={isDefaultView}
                className="p-2.5 text-gray-700 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Reset view"
                aria-label="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="h-px w-full bg-border" aria-hidden="true" />
              <button
                onClick={() =>
                  updateSettings({ showGraticule: !settings.showGraticule })
                }
                aria-pressed={settings.showGraticule}
                className={cn(
                  "p-2.5 transition hover:bg-accent dark:hover:bg-slate-700",
                  settings.showGraticule
                    ? "text-orange-500"
                    : "text-gray-700 dark:text-slate-200",
                )}
                title="Toggle grid lines"
                aria-label="Toggle grid lines"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom level readout (bottom right) */}
            {mapData && !loadingGeo && (
              <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-lg border border-border bg-white/90 px-2 py-1 text-[11px] font-semibold tabular-nums text-gray-600 shadow-sm backdrop-blur dark:bg-slate-800/90 dark:text-slate-300">
                {zoomPercent}%
              </div>
            )}

            {/* Legend (bottom left, hidden in fullscreen where the stats bar shows) */}
            {mapData && !loadingGeo && settings.showLegend && !fullscreen && (
              <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-3 rounded-lg border border-border bg-white/90 px-3 py-1.5 text-[11px] text-gray-600 shadow-sm backdrop-blur dark:bg-slate-800/90 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm border border-black/10"
                    style={{ backgroundColor: settings.visitedColor }}
                  />
                  Visited
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm border border-black/10"
                    style={{
                      backgroundColor:
                        settings.unvisitedColor === "transparent"
                          ? "transparent"
                          : settings.unvisitedColor,
                    }}
                  />
                  Not yet
                </span>
              </div>
            )}

            {/* Fullscreen bottom stats */}
            {fullscreen && mapData && !loadingGeo && (
              <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-lg font-bold leading-tight text-white">
                        {visitedCount}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/50">
                        Countries
                      </div>
                    </div>
                    {settings.showPercent && (
                      <div>
                        <div className="text-lg font-bold leading-tight text-white">
                          {percent}%
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-white/50">
                          Of world
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-lg font-bold leading-tight text-white">
                        {visitedContinents}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/50">
                        Continents
                      </div>
                    </div>
                  </div>
                  <div className="min-w-[180px] max-w-sm flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: settings.visitedColor,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-white/60">
                      {Math.max(TOTAL_COUNTRIES - visitedCount, 0)} of{" "}
                      {TOTAL_COUNTRIES} countries still to explore
                    </p>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    Exit fullscreen
                  </button>
                </div>
              </div>
            )}

            {loadingGeo ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/90 dark:bg-input/90 backdrop-blur-sm">
                <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading world map…
                </p>
              </div>
            ) : !mapData ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                {renderEmptyMap()}
              </div>
            ) : null}

            {/* Country picker (lives inside the fullscreen element so it
                stays usable in fullscreen too) */}
            <CountryPickerModal
              key={pickerKey}
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              visited={visited}
              onToggle={setCountryVisited}
              onSelectAll={selectAll}
              onClearAll={clearAll}
              visitedColor={settings.visitedColor}
              order={pickerOrder}
              onShuffle={() => setPickerOrder((prev) => shuffleArray(prev))}
            />
          </div>

          {/* Bottom stats bar */}
          <div className="border-t border-border bg-card dark:bg-input p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-orange-600 dark:text-orange-400 font-bold text-xl">
                {visitedCount}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                COUNTRIES
              </div>
            </div>
            {settings.showPercent ? (
              <div>
                <div className="text-orange-600 dark:text-orange-400 font-bold text-xl">
                  {percent}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  WORLD
                </div>
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="text-orange-600 dark:text-orange-400 font-bold text-xl">
                {visitedContinents}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                CONTINENTS
              </div>
            </div>
            <div className="col-span-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: settings.visitedColor,
                  }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {Math.max(TOTAL_COUNTRIES - visitedCount, 0)} of{" "}
                {TOTAL_COUNTRIES} countries still to explore
              </p>
            </div>
          </div>
        </div>

        {/* Custom tooltip */}
        <div
          ref={tooltipRef}
          className="fixed z-[60] hidden px-2.5 py-1.5 rounded-xl bg-gray-900 dark:bg-slate-900 text-xs text-white shadow-xl border border-white/10 pointer-events-none whitespace-nowrap drop-shadow-lg"
          suppressHydrationWarning
        />

        {/* Embed dialog */}
        <EmbedDialog
          open={embedOpen}
          onClose={() => setEmbedOpen(false)}
          code={embedCode}
        />

        {/* Reset confirmation */}
        <ConfirmDialog
          open={resetOpen}
          title="Reset everything?"
          description="This permanently clears your visited countries, profile photo, custom colours and saved preferences on this device. This can't be undone."
          confirmLabel="Reset all data"
          onConfirm={resetAllData}
          onClose={() => setResetOpen(false)}
        />

        {/* Profile photo editor */}
        <AvatarModal
          key={avatarKey}
          open={avatarOpen}
          avatar={settings.avatar}
          onSave={saveAvatar}
          onRemove={removeAvatar}
          onClose={() => setAvatarOpen(false)}
        />
      </ToolPageShell>

      {/* Settings drawer (overlay) */}
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        visitedCount={visitedCount}
        total={TOTAL_COUNTRIES}
        percent={percent}
        theme={theme}
        continentStats={continentStats}
      />
    </div>
  );
}

/* ================================================================== */
/*  Sub-components                                                    */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  Dropdown menu                                                     */
/* ------------------------------------------------------------------ */

// Lets a MenuItem close its parent Menu after the action runs.
const MenuCloseContext = React.createContext(null);

function Menu({ trigger, children, align = "right", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <MenuCloseContext.Provider value={close}>
          <div
            role="menu"
            className={cn(
              "absolute z-40 mt-2 min-w-[248px] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl dark:bg-input",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {children}
          </div>
        </MenuCloseContext.Provider>
      )}
    </div>
  );
}

function MenuItem({ icon, label, hint, onClick, disabled }) {
  const closeMenu = useContext(MenuCloseContext);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(e) => {
        if (disabled) return;
        try {
          onClick?.(e);
        } finally {
          // Always dismiss the dropdown once an option is chosen.
          closeMenu?.();
        }
      }}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-accent/40"
    >
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{label}</span>
        {hint && (
          <span className="block truncate text-[11px] text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
    </button>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {children}
    </h3>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm dark:bg-input/50">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ContinentBreakdown({ stats, visitedCount, total, percent }) {
  const regionOrder = [
    "europe",
    "asia",
    "africa",
    "north-america",
    "south-america",
    "oceania",
  ];
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
          Progress by Continent
        </h2>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {visitedCount} of {total} countries ({percent}%)
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {regionOrder.map((id) => {
          const s = stats[id];
          const label = regionLabels[id] || id;
          return (
            <div
              key={id}
              className="rounded-lg border border-border bg-card dark:bg-input p-3 shadow-sm flex flex-col items-center gap-1.5"
            >
              <span className="text-[10px] font-medium text-gray-900 dark:text-slate-100">
                {label}
              </span>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${s.percent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                {s.visited}/{s.total}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SettingsDrawer({
  open,
  onClose,
  settings,
  onUpdate,
  visitedCount,
  total,
  percent,
  theme,
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 dark:bg-input",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-foreground">
              Customize map
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Close customization panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-88px)] space-y-7 overflow-y-auto p-5 pb-10">
          {/* Themes */}
          <section>
            <SectionTitle icon={<Sparkles className="h-3.5 w-3.5" />}>
              Themes
            </SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {MAP_PRESETS.map((p) => {
                const active =
                  settings.visitedColor === p.visited &&
                  settings.unvisitedColor === p.unvisited &&
                  settings.borderColor === p.border &&
                  (settings.oceanColor || "") === p.ocean;
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      onUpdate({
                        visitedColor: p.visited,
                        unvisitedColor: p.unvisited,
                        borderColor: p.border,
                        oceanColor: p.ocean,
                      })
                    }
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium transition",
                      active
                        ? "border-orange-500 ring-2 ring-orange-500/30"
                        : "border-border bg-background hover:border-orange-500/50 dark:bg-input",
                    )}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: p.visited }}
                    />
                    <span className="truncate text-foreground">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Colors */}
          <section>
            <SectionTitle icon={<Droplet className="h-3.5 w-3.5" />}>
              Colors
            </SectionTitle>
            <div className="space-y-3">
              <ColorRow
                label="Visited"
                value={settings.visitedColor}
                onChange={(v) => onUpdate({ visitedColor: v })}
              />
              <ColorRow
                label="Unvisited"
                value={settings.unvisitedColor}
                onChange={(v) => onUpdate({ unvisitedColor: v })}
              />
              <ColorRow
                label="Borders"
                value={settings.borderColor}
                onChange={(v) => onUpdate({ borderColor: v })}
              />
              <ColorRow
                label="Ocean"
                value={
                  settings.oceanColor ||
                  (theme === "dark" ? "#0b1220" : "#eef4fb")
                }
                onChange={(v) => onUpdate({ oceanColor: v })}
              />
            </div>
          </section>

          {/* Map style */}
          <section>
            <SectionTitle icon={<Ruler className="h-3.5 w-3.5" />}>
              Map style
            </SectionTitle>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Border thickness
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {Number(settings.borderWidth).toFixed(2)}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.05"
                  value={settings.borderWidth}
                  onChange={(e) =>
                    onUpdate({ borderWidth: Number(e.target.value) })
                  }
                  className="h-1.5 w-full accent-orange-500"
                  aria-label="Border thickness"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Unvisited opacity
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {Math.round(Number(settings.unvisitedOpacity ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.unvisitedOpacity ?? 1}
                  onChange={(e) =>
                    onUpdate({ unvisitedOpacity: Number(e.target.value) })
                  }
                  className="h-1.5 w-full accent-orange-500"
                  aria-label="Unvisited opacity"
                />
              </div>
              <ToggleRow
                label="Show country borders"
                checked={settings.showBorders}
                onChange={(v) => onUpdate({ showBorders: v })}
              />
              <ToggleRow
                label="Show grid lines"
                checked={settings.showGraticule}
                onChange={(v) => onUpdate({ showGraticule: v })}
              />
              <ToggleRow
                label="Show map legend"
                checked={settings.showLegend}
                onChange={(v) => onUpdate({ showLegend: v })}
              />
            </div>
          </section>

          {/* Display */}
          <section>
            <SectionTitle>Display</SectionTitle>
            <div className="space-y-3">
              <ToggleRow
                label="Country names on hover"
                checked={settings.showNames}
                onChange={(v) => onUpdate({ showNames: v })}
              />
              <ToggleRow
                label="Show world % stat"
                checked={settings.showPercent}
                onChange={(v) => onUpdate({ showPercent: v })}
              />
              <ToggleRow
                label="Highlight visited countries"
                checked={settings.highlightVisited}
                onChange={(v) => onUpdate({ highlightVisited: v })}
              />
            </div>
          </section>

          {/* Photo card */}
          <section>
            <SectionTitle icon={<ImageDown className="h-3.5 w-3.5" />}>
              Photo card
            </SectionTitle>
            <div className="space-y-3">
              <ToggleRow
                label="Show stats on the card"
                checked={settings.cardShowStats}
                onChange={(v) => onUpdate({ cardShowStats: v })}
              />
              <ToggleRow
                label="Show progress bar on the card"
                checked={settings.cardShowProgress}
                onChange={(v) => onUpdate({ cardShowProgress: v })}
              />
              <ToggleRow
                label="Show profile photo on the card"
                checked={settings.cardShowAvatar}
                onChange={(v) => onUpdate({ cardShowAvatar: v })}
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Your name and profile photo (set in the toolbar above) plus the{" "}
              {SITE_NAME} footer appear on exported cards.
            </p>
          </section>

          {/* Progress */}
          <section className="border-t border-border pt-5">
            <SectionTitle>Progress</SectionTitle>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Visited</span>
                <span>{visitedCount}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Remaining</span>
                <span>{total - visitedCount}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>World explored</span>
                <span>{percent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-border pt-5">
            <button
              onClick={() => {
                onUpdate({ ...DEFAULT_SETTINGS });
                toast("Customization reset to default");
              }}
              className="w-full rounded-lg border border-destructive py-2 text-center text-sm text-destructive transition hover:bg-destructive/10"
            >
              Reset customization
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function ChevronDown({ className = "" }) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
          title={label}
          aria-label={`${label} color`}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs uppercase text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 dark:bg-input"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
          checked
            ? "border-orange-500 bg-orange-500"
            : "border-input bg-background dark:bg-input"
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow transform transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function CountrySearchButton({ onClick, compact = false, className = "" }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="dialog"
        aria-label="Search countries — open the country picker"
        title="Search countries"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-accent dark:bg-input dark:text-slate-200 dark:hover:bg-accent/50",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label="Search countries — open the country picker"
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl border border-input bg-input px-3 py-2.5 text-left text-sm transition hover:border-orange-400 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 dark:bg-slate-700 dark:hover:bg-slate-600",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-orange-500" />
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        Search a country, then click it to mark visited…
      </span>
      <span className="hidden shrink-0 items-center rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline-flex">
        Browse
      </span>
    </button>
  );
}

function EmbedDialog({ open, onClose, code }) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 opacity-100 pointer-events-auto"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md bg-card dark:bg-input rounded-2xl border border-border shadow-2xl transform translate-x-[-50%] translate-y-[-50%] p-6 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Embed your map
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Copy this HTML to display your visited countries map on any blog or
          website.
        </p>
        <div className="relative mb-4">
          <textarea
            value={code}
            readOnly
            rows={3}
            className="w-full text-xs font-mono text-foreground bg-input dark:bg-slate-800 border border-border rounded p-3 focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast("Embed code copied");
            }}
            className="absolute right-2 top-2 px-2 py-1 text-xs border rounded bg-orange-500 text-orange-50 hover:bg-orange-600 transition"
            title="Copy"
          >
            <ArrowUpRightFromSquare className="w-3 h-3" />
          </button>
        </div>
        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-border bg-background dark:bg-input text-sm font-semibold text-foreground hover:bg-accent dark:hover:bg-accent/50 transition"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

EmbedDialog.displayName = "EmbedDialog";

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl dark:bg-input"
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-accent dark:bg-input"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-destructive px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-destructive/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

ConfirmDialog.displayName = "ConfirmDialog";

/* ------------------------------------------------------------------ */
/*  Profile photo: preview, toolbar button and crop editor            */
/* ------------------------------------------------------------------ */

/** Renders the cropped photo inside a container of exactly `size` px. */
function AvatarPhoto({ avatar, size }) {
  const [dims, setDims] = useState(null);
  const src = avatar?.src;

  useEffect(() => {
    if (!src) return undefined;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setDims({
          w: img.naturalWidth || img.width,
          h: img.naturalHeight || img.height,
        });
      }
    };
    img.onerror = () => {
      if (!cancelled) setDims(null);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src || !dims) return null;
  const r = avatarDrawRect(dims.w, dims.h, size, avatar);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
      style={{
        width: r.w,
        height: r.h,
        transform: `translate3d(${r.x}px, ${r.y}px, 0)`,
      }}
    />
  );
}

function AvatarButton({ avatar, onClick }) {
  const hasPhoto = !!avatar?.src;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      title={hasPhoto ? "Edit your profile photo" : "Add a profile photo"}
      aria-label={hasPhoto ? "Edit your profile photo" : "Add a profile photo"}
      className="group relative h-11 w-11 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
    >
      <span
        className={cn(
          "relative block h-full w-full overflow-hidden rounded-full",
          hasPhoto
            ? "bg-muted ring-2 ring-orange-500/60 group-hover:ring-orange-500"
            : "border-2 border-dashed border-border bg-background group-hover:border-orange-400 group-hover:bg-accent dark:bg-input",
        )}
      >
        {hasPhoto ? (
          <AvatarPhoto avatar={avatar} size={AVATAR_BUTTON_SIZE} />
        ) : (
          <UserRound className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground transition group-hover:text-orange-500" />
        )}
      </span>
      {hasPhoto && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

function AvatarModal({ open, onClose, avatar, onSave, onRemove }) {
  const [src, setSrc] = useState(avatar?.src || "");
  const [crop, setCrop] = useState(() =>
    avatar?.src
      ? {
          zoom: avatar.zoom || 1,
          offsetX: avatar.offsetX || 0,
          offsetY: avatar.offsetY || 0,
        }
      : { ...DEFAULT_AVATAR_CROP },
  );
  const [dims, setDims] = useState(null);
  const [size, setSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dropActive, setDropActive] = useState(false);
  const [dragging, setDragging] = useState(false);

  const viewportRef = useRef(null);
  const fileRef = useRef(null);
  const dragRef = useRef(null);

  // Escape closes the editor.
  useEffect(() => {
    if (!open) return undefined;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Measure the (responsive) crop viewport.
  useEffect(() => {
    if (!open || !src) return undefined;
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setSize(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, src]);

  // Resolve the source image's natural size.
  useEffect(() => {
    if (!src) return undefined;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setDims({
          w: img.naturalWidth || img.width,
          h: img.naturalHeight || img.height,
        });
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setDims(null);
        setError("That photo could not be loaded.");
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  const applyFile = useCallback(async (file) => {
    setError("");
    setBusy(true);
    try {
      const result = await processAvatarFile(file);
      setDims(null);
      setCrop({ ...DEFAULT_AVATAR_CROP });
      setSrc(result.src);
    } catch (err) {
      setError(err?.message || "That photo could not be used.");
    } finally {
      setBusy(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDropActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) applyFile(file);
    },
    [applyFile],
  );

  const changeZoom = useCallback(
    (next) => {
      setCrop((c) =>
        dims && size
          ? clampAvatarCrop(dims.w, dims.h, size, { ...c, zoom: next })
          : { ...c, zoom: clampNumber(next, AVATAR_MIN_ZOOM, AVATAR_MAX_ZOOM) },
      );
    },
    [dims, size],
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (!dims || !size) return;
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } catch {
        // capture is a nicety, not a requirement
      }
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        ...clampAvatarCrop(dims.w, dims.h, size, crop),
      };
      setDragging(true);
    },
    [dims, size, crop],
  );

  const handlePointerMove = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d || !dims || !size) return;
      setCrop(
        clampAvatarCrop(dims.w, dims.h, size, {
          zoom: d.zoom,
          offsetX: d.offsetX + (e.clientX - d.x) / size,
          offsetY: d.offsetY + (e.clientY - d.y) / size,
        }),
      );
    },
    [dims, size],
  );

  const handlePointerUp = useCallback((e) => {
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // already released
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!src) {
      onClose();
      return;
    }
    const effective =
      dims && size
        ? clampAvatarCrop(dims.w, dims.h, size, crop)
        : { ...DEFAULT_AVATAR_CROP };
    onSave({ src, ...effective });
  }, [src, crop, dims, size, onSave, onClose]);

  const handleRemove = useCallback(() => {
    setSrc("");
    setDims(null);
    setCrop({ ...DEFAULT_AVATAR_CROP });
    setError("");
    onRemove();
  }, [onRemove]);

  if (!open) return null;

  const rect = dims && size ? avatarDrawRect(dims.w, dims.h, size, crop) : null;
  const zoomSteps = Math.round((crop.zoom - AVATAR_MIN_ZOOM) * 100) / 100;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Profile photo"
        className="fixed left-1/2 top-1/2 z-[70] flex max-h-[92vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl dark:bg-input"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Profile photo
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {src
                  ? "Drag to reposition · zoom to choose what shows on your card."
                  : "Add a photo for your map and exported card."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile photo editor"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {!src ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDropActive(true);
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
                dropActive
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-border bg-background/60 dark:bg-slate-800/40",
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <UploadCloud className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-foreground">
                Drag &amp; drop your photo here
              </p>
              <p className="text-xs text-muted-foreground">
                or choose a file below · JPG, PNG, WebP or GIF · up to{" "}
                {AVATAR_MAX_FILE_MB} MB
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="mt-1 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-600 disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    Choose a photo
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropActive(true);
                }}
                onDragLeave={() => setDropActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative aspect-square w-[min(264px,calc(100vw-7rem))] touch-none select-none overflow-hidden rounded-2xl bg-slate-900",
                  dragging ? "cursor-grabbing" : "cursor-grab",
                  dropActive && "ring-2 ring-orange-500",
                )}
              >
                {rect && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
                    style={{
                      width: rect.w,
                      height: rect.h,
                      transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
                    }}
                  />
                )}
                {/* Circular guide — dims everything outside the circle */}
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 0 0 9999px rgba(2,6,23,0.55)" }}
                  />
                  <div className="absolute inset-0 rounded-full ring-1 ring-white/70" />
                </div>
              </div>

              {/* Zoom */}
              <div className="flex w-full max-w-[264px] items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => changeZoom(crop.zoom - 0.15)}
                  disabled={zoomSteps <= 0}
                  aria-label="Zoom out"
                  className="rounded-lg border border-border p-2 text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min={AVATAR_MIN_ZOOM}
                  max={AVATAR_MAX_ZOOM}
                  step="0.01"
                  value={crop.zoom}
                  onChange={(e) => changeZoom(Number(e.target.value))}
                  aria-label="Photo zoom"
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-orange-500"
                />
                <button
                  type="button"
                  onClick={() => changeZoom(crop.zoom + 0.15)}
                  disabled={crop.zoom >= AVATAR_MAX_ZOOM - 1e-3}
                  aria-label="Zoom in"
                  className="rounded-lg border border-border p-2 text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-60 dark:bg-input"
                >
                  {busy ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  Choose another
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-destructive transition hover:border-destructive/40 hover:bg-destructive/10 dark:bg-input"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove photo
                </button>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 text-center text-xs font-medium text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-accent dark:bg-input"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!src || busy}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save photo
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) applyFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </>
  );
}

AvatarModal.displayName = "AvatarModal";

/* ------------------------------------------------------------------ */
/*  Country picker modal                                              */
/* ------------------------------------------------------------------ */

function shuffleArray(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function CountryPickerModal({
  open,
  onClose,
  visited,
  onToggle,
  onSelectAll,
  onClearAll,
  visitedColor = "#2563eb",
  order = [],
  onShuffle,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  const byIso = useMemo(() => new Map(COUNTRIES.map((c) => [c.iso2, c])), []);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term) {
      return COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.iso2.toLowerCase().includes(term) ||
          (c.iso3 || "").toLowerCase().includes(term),
      ).sort((a, b) => a.name.localeCompare(b.name));
    }
    return order.map((iso) => byIso.get(iso)).filter(Boolean);
  }, [query, order, byIso]);

  if (!open) return null;

  const smallBtn =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-accent dark:bg-input";

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose the countries you have visited"
        className="fixed left-1/2 top-1/2 z-[70] flex max-h-[88vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl dark:bg-input"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Choose your countries
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tap a country to mark it visited — tap again to undo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Close country picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search + bulk actions */}
        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a country…"
              aria-label="Search countries in the picker"
              className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 dark:bg-slate-800"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {visited.size} selected
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onShuffle}
                className={smallBtn}
                title="Shuffle the order"
              >
                <Shuffle className="h-3.5 w-3.5" /> Shuffle
              </button>
              <button
                type="button"
                onClick={onSelectAll}
                className={smallBtn}
                title="Mark every country as visited"
              >
                <CheckCheck className="h-3.5 w-3.5" /> All
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className={smallBtn}
                title="Clear all selections"
              >
                <Eraser className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Country grid */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No countries match “{query.trim()}”.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {list.map((c) => {
                const isVisited = visited.has(c.iso2);
                return (
                  <button
                    key={c.iso2}
                    type="button"
                    onClick={() => onToggle(c.iso2, !isVisited)}
                    aria-pressed={isVisited}
                    title={
                      isVisited
                        ? `Unmark ${c.name}`
                        : `Mark ${c.name} as visited`
                    }
                    style={
                      isVisited
                        ? {
                            backgroundColor: visitedColor,
                            borderColor: visitedColor,
                          }
                        : undefined
                    }
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition",
                      isVisited
                        ? "text-white shadow-sm"
                        : "border-border bg-background text-foreground hover:bg-accent dark:bg-input",
                    )}
                  >
                    <FlagBadge iso2={c.iso2} />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    {isVisited && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-orange-50 transition hover:bg-orange-600"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

CountryPickerModal.displayName = "CountryPickerModal";
