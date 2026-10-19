"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Dog & Cat Age Calculator — clipboard, downloads & branded PNG card
// ─────────────────────────────────────────────────────────────────────────────
import {
  UNITS,
  formatCompact,
  formatDateUTC,
  formatNumber,
  formatYearsMonths,
  toISODate,
} from "./petData";

export async function copyText(text) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy clipboard path.
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  } catch {
    return false;
  }
}

export function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function petFileSlug(name) {
  const slug = (name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return slug || "report";
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas helpers
// ─────────────────────────────────────────────────────────────────────────────
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 880;
const PADDING = 48;

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPaw(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.22, size * 0.4, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  const toes = [
    [-0.44, -0.12, -0.35],
    [-0.18, -0.34, -0.2],
    [0.18, -0.34, 0.2],
    [0.44, -0.12, 0.35],
  ];
  toes.forEach(([tx, ty, rotation]) => {
    ctx.beginPath();
    ctx.ellipse(tx * size, ty * size, size * 0.15, size * 0.19, rotation, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let value = text;
  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value.trim()}…`;
}

function metaLabel(report) {
  return report.type === "dog"
    ? `${report.size.label} dog`
    : `${report.lifestyle.label} cat`;
}

function statValue(stat) {
  return `${stat.approximate ? "≈ " : ""}${formatCompact(stat.value, 0)}`;
}

function buildPetCardCanvas(report, { name, units = UNITS.METRIC, decimals = 1 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * 2;
  canvas.height = CARD_HEIGHT * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  const ink = "#1F2937";
  const muted = "#6B7280";
  const accent = "#EA580C";
  const cream = "#FFF9F4";
  const petName =
    (name || "").trim() ||
    (report.type === "dog" ? "My dog" : "My cat");

  // Background
  ctx.fillStyle = cream;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Warm header band
  const headerGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, 320);
  headerGradient.addColorStop(0, "#F59E0B");
  headerGradient.addColorStop(0.55, "#F97316");
  headerGradient.addColorStop(1, "#E11D48");
  ctx.fillStyle = headerGradient;
  ctx.fillRect(0, 0, CARD_WIDTH, 320);

  // Paw watermarks
  drawPaw(ctx, 930, 74, 150, "rgba(255,255,255,0.12)");
  drawPaw(ctx, 1060, 190, 70, "rgba(255,255,255,0.10)");
  drawPaw(ctx, 830, 230, 44, "rgba(255,255,255,0.10)");

  // Header wordmark + badge
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 27px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("TOOLSTREK", PADDING, 76);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "600 15px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("DOG & CAT AGE CALCULATOR", PADDING, 102);

  const badgeText = `${metaLabel(report).toUpperCase()}`;
  ctx.font = "700 16px 'Segoe UI', system-ui, sans-serif";
  const badgeWidth = ctx.measureText(badgeText).width + 38;
  roundRect(ctx, CARD_WIDTH - PADDING - badgeWidth, 52, badgeWidth, 38, 19);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(badgeText, CARD_WIDTH - PADDING - badgeWidth / 2, 77);
  ctx.textAlign = "left";

  // Main white card
  const cardX = PADDING;
  const cardY = 232;
  const cardW = CARD_WIDTH - PADDING * 2;
  const cardH = 600;
  ctx.save();
  ctx.shadowColor = "rgba(31,41,55,0.16)";
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, cardX, cardY, cardW, cardH, 34);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();
  roundRect(ctx, cardX, cardY, cardW, cardH, 34);
  ctx.strokeStyle = "rgba(249,115,22,0.16)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pet name & details
  ctx.fillStyle = ink;
  ctx.font = "800 46px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(fitText(ctx, petName, cardW - 460), 92, 318);
  ctx.fillStyle = muted;
  ctx.font = "500 21px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(
    `${metaLabel(report)} · born ${formatDateUTC(report.dob)} · ${formatYearsMonths(
      report.petAge
    )} old`,
    92,
    354
  );

  // Stage pill
  const stageText = report.stage.label.toUpperCase();
  ctx.font = "700 14px 'Segoe UI', system-ui, sans-serif";
  const stageWidth = ctx.measureText(stageText).width + 32;
  roundRect(ctx, 92, 376, stageWidth, 32, 16);
  ctx.fillStyle = "#FFF1E6";
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.fillText(stageText, 108, 397);

  // Big human age
  const humanGradient = ctx.createLinearGradient(92, 440, 400, 570);
  humanGradient.addColorStop(0, "#F59E0B");
  humanGradient.addColorStop(1, "#E11D48");
  ctx.fillStyle = humanGradient;
  ctx.font = "800 132px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(formatNumber(report.human.years, decimals), 88, 532);

  ctx.fillStyle = muted;
  ctx.font = "700 20px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("HUMAN YEARS", 92, 570);
  ctx.font = "500 20px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`Calculated with the ${report.human.methodLabel}`, 92, 602);

  // Progress ring
  const ringX = CARD_WIDTH - PADDING - 190;
  const ringY = 468;
  const ringRadius = 82;
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(249,115,22,0.14)";
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  const ringGradient = ctx.createLinearGradient(
    ringX - ringRadius,
    ringY - ringRadius,
    ringX + ringRadius,
    ringY + ringRadius
  );
  ringGradient.addColorStop(0, "#F59E0B");
  ringGradient.addColorStop(1, "#E11D48");
  ctx.strokeStyle = ringGradient;
  ctx.beginPath();
  ctx.arc(
    ringX,
    ringY,
    ringRadius,
    -Math.PI / 2,
    -Math.PI / 2 + Math.max(0.001, report.lifespanPercent) * Math.PI * 2
  );
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.textAlign = "center";
  ctx.fillStyle = ink;
  ctx.font = "800 42px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`${Math.round(report.lifespanPercent * 100)}%`, ringX, ringY + 2);
  ctx.fillStyle = muted;
  ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("LIFE LIVED", ringX, ringY + 26);
  ctx.font = "500 16px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("Typical lifespan", ringX, ringY + 108);
  ctx.fillStyle = ink;
  ctx.font = "700 21px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(
    `${formatNumber(report.lifespan.min, 1)}–${formatNumber(report.lifespan.max, 1)} yrs`,
    ringX,
    ringY + 134
  );
  ctx.textAlign = "left";

  // Stat tiles
  const tileStats = [
    report.stats.find((stat) => stat.id === "days"),
    report.stats.find((stat) => stat.id === "heartbeats"),
    report.stats.find((stat) => stat.id === "sleep"),
  ].filter(Boolean);
  const tileGap = 16;
  const tileW = (cardW - 184 - tileGap * (tileStats.length - 1)) / tileStats.length;
  const tileY = 636;
  const tileH = 92;
  tileStats.forEach((stat, index) => {
    const x = 92 + index * (tileW + tileGap);
    roundRect(ctx, x, tileY, tileW, tileH, 18);
    ctx.fillStyle = "#FFF7ED";
    ctx.fill();
    roundRect(ctx, x, tileY, tileW, tileH, 18);
    ctx.strokeStyle = "rgba(249,115,22,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#9A3412";
    ctx.font = "700 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(stat.label.toUpperCase(), x + 18, tileY + 32);
    ctx.fillStyle = ink;
    ctx.font = "800 28px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(statValue(stat), x + 18, tileY + 68);
  });

  // Footer line
  ctx.fillStyle = muted;
  ctx.font = "500 17px 'Segoe UI', system-ui, sans-serif";
  const birthdayLine = report.birthday.isToday
    ? "Birthday: today! Happy birthday!"
    : `Next birthday: ${formatDateUTC(report.birthday.date)} · ${formatCompact(
        report.birthday.days,
        0
      )} days away`;
  ctx.fillText(fitText(ctx, birthdayLine, 620), 92, 790);
  ctx.textAlign = "right";
  ctx.font = "600 15px 'Segoe UI', system-ui, sans-serif";
  ctx.fillStyle = "rgba(107,114,128,0.85)";
  ctx.fillText("toolstrek.vercel.app/tools/dog-cat-age-calculator", CARD_WIDTH - 92, 790);
  ctx.textAlign = "left";

  return canvas;
}

export function downloadPetCard(report, { name, units = UNITS.METRIC, decimals = 1 } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = buildPetCardCanvas(report, { name, units, decimals });
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("The canvas could not be exported."));
          return;
        }
        try {
          const filename = `toolstrek-pet-age-${petFileSlug(name)}-${toISODate(
            report.asOf
          )}.png`;
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.rel = "noopener";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          resolve(filename);
        } catch (error) {
          reject(error);
        }
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}
