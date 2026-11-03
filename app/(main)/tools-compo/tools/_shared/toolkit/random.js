/**
 * Shared, dependency-free randomness and download helpers for ToolsTrek
 * picker-style tools (wheel spinner, random picker, coin flip & dice).
 *
 * Every random decision uses the Web Crypto API when available so results
 * are suitable for raffles, giveaways and classroom use.
 */

export function secureUnit() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / 4294967296;
  }
  return Math.random();
}

export function randomInt(min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return low + Math.floor(secureUnit() * (high - low + 1));
}

export function pickIndex(weights = []) {
  const total = weights.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  if (!weights.length || total <= 0) return -1;
  let threshold = secureUnit() * total;
  for (let index = 0; index < weights.length; index += 1) {
    threshold -= Math.max(0, Number(weights[index]) || 0);
    if (threshold < 0) return index;
  }
  return weights.length - 1;
}

export function shuffleArray(items = []) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = randomInt(0, index);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function sampleWithoutReplacement(items = [], count = 1, weights = null) {
  const pool = items.map((item, index) => ({
    item,
    weight: weights ? Math.max(0, Number(weights[index]) || 0) : 1,
  }));
  const picked = [];
  const target = Math.min(Math.max(1, count), pool.length);
  while (picked.length < target && pool.length) {
    const index = pickIndex(pool.map((entry) => entry.weight));
    if (index < 0) break;
    picked.push(pool[index].item);
    pool.splice(index, 1);
  }
  return picked;
}

export function sampleWithReplacement(items = [], count = 1, weights = null) {
  const picked = [];
  for (let index = 0; index < count; index += 1) {
    const pick = pickIndex(weights || items.map(() => 1));
    if (pick < 0) break;
    picked.push(items[pick]);
  }
  return picked;
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function downloadBlob(blob, fileName) {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export function downloadText(text, fileName, type = "text/plain;charset=utf-8") {
  downloadBlob(new Blob([text], { type }), fileName);
}

export function toCsv(rows = []) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");
}

export function formatClock(totalSeconds = 0) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = Math.floor(safe % 60);
  const hundredths = Math.floor((safe % 1) * 100);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(
    hundredths,
  ).padStart(2, "0")}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}
