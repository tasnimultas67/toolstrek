// app/(main)/tools-compo/tools/age-on-other-planets/planetShare.js
// Client-side export helpers for the Age on Other Planets tool: clipboard,
// text/CSV/JSON downloads and the branded PNG report card. The card is drawn
// directly on a canvas so it never depends on screenshot libraries and always
// renders identically in light or dark mode.

import {
  UNITS,
  formatDateUTC,
  formatNumber,
  toISODate,
  buildShareText,
} from "./planetData";

// ─────────────────────────────────────────────────────────────────────────────
// Clipboard with a graceful fallback for unfocused documents
// ─────────────────────────────────────────────────────────────────────────────
export async function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path below.
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic downloads
// ─────────────────────────────────────────────────────────────────────────────
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// Branded PNG report card
// ─────────────────────────────────────────────────────────────────────────────
const CARD_WIDTH = 1200;
const CARD_PADDING = 64;
const CELL_GAP = 22;

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawOrb(ctx, cx, cy, radius, accent, ring) {
  const gradient = ctx.createRadialGradient(
    cx - radius * 0.35,
    cy - radius * 0.4,
    radius * 0.15,
    cx,
    cy,
    radius
  );
  gradient.addColorStop(0, accent.core);
  gradient.addColorStop(0.55, accent.mid);
  gradient.addColorStop(1, accent.edge);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  if (ring) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.85, radius * 0.62, -0.35, 0, Math.PI * 2);
    ctx.strokeStyle = accent.mid;
    ctx.lineWidth = Math.max(3, radius * 0.16);
    ctx.globalAlpha = 0.85;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPlanetCard(report, settings) {
  if (!report?.ok || typeof document === "undefined") return null;

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const enabled = report.planets.filter((planet) => settings.enabledIds.includes(planet.id));
  const columns = 3;
  const rows = Math.max(1, Math.ceil(enabled.length / columns));
  const contentWidth = CARD_WIDTH - CARD_PADDING * 2;
  const cellWidth = (contentWidth - CELL_GAP * (columns - 1)) / columns;
  const cellHeight = 148;

  const headerHeight = 320;
  const gridHeight = rows * cellHeight + (rows - 1) * CELL_GAP;
  const footerHeight = 120;
  const cardHeight = headerHeight + gridHeight + footerHeight + CARD_PADDING;

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = cardHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  const background = ctx.createLinearGradient(0, 0, CARD_WIDTH, cardHeight);
  if (isDark) {
    background.addColorStop(0, "#070b18");
    background.addColorStop(0.5, "#0d1428");
    background.addColorStop(1, "#070b18");
  } else {
    background.addColorStop(0, "#f8fafc");
    background.addColorStop(0.5, "#eef2ff");
    background.addColorStop(1, "#f8fafc");
  }
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CARD_WIDTH, cardHeight);

  // Ambient glows
  const glow = ctx.createRadialGradient(180, 120, 20, 180, 120, 460);
  glow.addColorStop(0, isDark ? "rgba(124,0,254,0.35)" : "rgba(124,0,254,0.16)");
  glow.addColorStop(1, "rgba(124,0,254,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, headerHeight + 120);

  const glow2 = ctx.createRadialGradient(CARD_WIDTH - 160, 220, 20, CARD_WIDTH - 160, 220, 420);
  glow2.addColorStop(0, isDark ? "rgba(34,211,238,0.22)" : "rgba(14,165,233,0.14)");
  glow2.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, CARD_WIDTH, headerHeight + 120);

  const ink = isDark ? "#f8fafc" : "#0f172a";
  const muted = isDark ? "#94a3b8" : "#64748b";
  const panel = isDark ? "rgba(17,26,51,0.72)" : "rgba(255,255,255,0.86)";
  const panelBorder = isDark ? "rgba(148,163,184,0.18)" : "rgba(100,116,139,0.16)";

  // ── Header ────────────────────────────────────────────────────────────────
  ctx.textBaseline = "alphabetic";

  // Badge
  const badgeText = "TOOLSTREK · SPACE CALCULATOR";
  ctx.font = "600 20px 'Segoe UI', system-ui, sans-serif";
  const badgeWidth = ctx.measureText(badgeText).width + 44;
  roundedRect(ctx, CARD_PADDING, 56, badgeWidth, 44, 22);
  ctx.fillStyle = isDark ? "rgba(124,0,254,0.28)" : "rgba(124,0,254,0.12)";
  ctx.fill();
  ctx.fillStyle = isDark ? "#d8b4fe" : "#7c3aed";
  ctx.fillText(badgeText, CARD_PADDING + 22, 85);

  // Title
  ctx.fillStyle = ink;
  ctx.font = "800 58px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("My Age on Other Planets", CARD_PADDING, 178);

  // Name + dates
  const nameLine = settings.name?.trim()
    ? `${settings.name.trim()} · born ${formatDateUTC(report.dob)}`
    : `Born ${formatDateUTC(report.dob)}`;
  ctx.font = "500 26px 'Segoe UI', system-ui, sans-serif";
  ctx.fillStyle = muted;
  ctx.fillText(nameLine, CARD_PADDING, 224);
  ctx.fillText(
    `Calculated as of ${formatDateUTC(report.asOf)} · ${new Intl.NumberFormat("en-US").format(report.earthDaysWhole)} Earth days lived`,
    CARD_PADDING,
    260
  );

  // Hero panel
  const heroY = 286;
  const heroHeight = 132;
  roundedRect(ctx, CARD_PADDING, heroY, contentWidth, heroHeight, 26);
  ctx.fillStyle = panel;
  ctx.fill();
  ctx.strokeStyle = panelBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = isDark ? "#a78bfa" : "#7c3aed";
  ctx.font = "700 18px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("EARTH AGE", CARD_PADDING + 36, heroY + 46);
  ctx.fillStyle = ink;
  ctx.font = "800 52px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`${formatNumber(report.calendarYears, 1)} years`, CARD_PADDING + 36, heroY + 102);

  const heroRight = CARD_PADDING + contentWidth - 36;
  const cardPlanets = enabled.length ? enabled : report.planets;
  const cardOldest = cardPlanets.reduce((best, planet) => (planet.years > best.years ? planet : best));
  const cardYoungest = cardPlanets.reduce((best, planet) => (planet.years < best.years ? planet : best));
  ctx.textAlign = "right";
  ctx.fillStyle = muted;
  ctx.font = "600 18px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("OLDEST WORLD", heroRight, heroY + 46);
  ctx.fillStyle = ink;
  ctx.font = "800 34px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`${cardOldest.name} · ${formatNumber(cardOldest.years, 1)} yrs`, heroRight, heroY + 88);
  ctx.fillStyle = muted;
  ctx.font = "500 18px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(
    `Youngest: ${cardYoungest.name} · ${formatNumber(cardYoungest.years, 2)} yrs`,
    heroRight,
    heroY + 114
  );
  ctx.textAlign = "left";

  // ── Planet grid ───────────────────────────────────────────────────────────
  const gridTop = headerHeight + 16;

  enabled.forEach((planet, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = CARD_PADDING + column * (cellWidth + CELL_GAP);
    const y = gridTop + row * (cellHeight + CELL_GAP);

    roundedRect(ctx, x, y, cellWidth, cellHeight, 22);
    ctx.fillStyle = panel;
    ctx.fill();
    ctx.strokeStyle = panelBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    drawOrb(ctx, x + 74, y + cellHeight / 2, 34, planet.accent, planet.ring);

    ctx.fillStyle = ink;
    ctx.font = "700 26px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(planet.name, x + 132, y + 58);

    ctx.fillStyle = planet.accent.edge;
    if (isDark) ctx.fillStyle = planet.accent.mid;
    ctx.font = "800 32px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(`${formatNumber(planet.years, 2)} yrs`, x + 132, y + 96);

    ctx.fillStyle = muted;
    ctx.font = "500 17px 'Segoe UI', system-ui, sans-serif";
    const localLabel = `${formatNumber(planet.localDays, 0)} ${planet.id === "mars" ? "sols" : "local days"}`;
    ctx.fillText(localLabel, x + 132, y + 124);
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = gridTop + gridHeight + 26;
  ctx.strokeStyle = panelBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CARD_PADDING, footerY);
  ctx.lineTo(CARD_WIDTH - CARD_PADDING, footerY);
  ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = "500 20px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(
    "Orbital periods are mean sidereal values — perfect for fun, not for mission planning.",
    CARD_PADDING,
    footerY + 44
  );

  ctx.textAlign = "right";
  ctx.fillStyle = isDark ? "#a78bfa" : "#7c3aed";
  ctx.font = "700 20px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("toolstrek.vercel.app", CARD_WIDTH - CARD_PADDING, footerY + 44);
  ctx.textAlign = "left";

  return canvas;
}

export function downloadPlanetCard(report, settings) {
  const canvas = drawPlanetCard(report, settings);
  if (!canvas) return Promise.reject(new Error("Canvas unavailable"));

  const filename = `toolstrek-planet-age-${toISODate(report.asOf) || "today"}.png`;

  return new Promise((resolve, reject) => {
    try {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Could not encode the card"));
            return;
          }
          downloadBlob(blob, filename);
          resolve(filename);
        }, "image/png");
        return;
      }
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve(filename);
    } catch (error) {
      reject(error);
    }
  });
}

export function buildTextExport(report, settings) {
  return buildShareText(report, {
    units: settings.units ?? UNITS.METRIC,
    milestone: settings.milestone,
  });
}
