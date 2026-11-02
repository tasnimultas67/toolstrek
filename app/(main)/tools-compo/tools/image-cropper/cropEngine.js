/**
 * Geometry and canvas helpers for the ToolsTrek image cropper.
 * All crop geometry is kept in stage pixels and converted back to
 * source pixels only at export time.
 */

export function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function fitScale(oriented, stage) {
  if (!oriented?.w || !oriented?.h || !stage?.w || !stage?.h) return 1;
  return Math.min(stage.w / oriented.w, stage.h / oriented.h);
}

export function imageRect(view, oriented, baseScale) {
  const scale = baseScale * view.zoom;
  return {
    x: view.x,
    y: view.y,
    w: oriented.w * scale,
    h: oriented.h * scale,
    scale,
  };
}

/** Visible image rectangle, clipped to the stage. */
export function visibleBounds(view, oriented, baseScale, stage) {
  const rect = imageRect(view, oriented, baseScale);
  const left = Math.max(0, rect.x);
  const top = Math.max(0, rect.y);
  const right = Math.min(stage.w, rect.x + rect.w);
  const bottom = Math.min(stage.h, rect.y + rect.h);
  return {
    x: left,
    y: top,
    w: Math.max(24, right - left),
    h: Math.max(24, bottom - top),
  };
}

/** Keep the image covering the stage when zoomed in; centre it when smaller. */
export function clampPan(pan, oriented, stage) {
  const scale = fitScale(oriented, stage) * pan.zoom;
  const width = oriented.w * scale;
  const height = oriented.h * scale;

  const x =
    width <= stage.w
      ? (stage.w - width) / 2
      : clamp(pan.x, stage.w - width, 0);
  const y =
    height <= stage.h
      ? (stage.h - height) / 2
      : clamp(pan.y, stage.h - height, 0);

  return { ...pan, x, y };
}

export function centeredView(oriented, stage) {
  const scale = fitScale(oriented, stage);
  return {
    zoom: 1,
    x: (stage.w - oriented.w * scale) / 2,
    y: (stage.h - oriented.h * scale) / 2,
  };
}

export function defaultCrop(bounds, ratio, fill = 0.86) {
  const availableW = Math.max(24, bounds.w * fill);
  const availableH = Math.max(24, bounds.h * fill);

  if (!ratio) {
    return {
      x: bounds.x + (bounds.w - availableW) / 2,
      y: bounds.y + (bounds.h - availableH) / 2,
      w: availableW,
      h: availableH,
    };
  }

  let w = availableW;
  let h = w / ratio;
  if (h > availableH) {
    h = availableH;
    w = h * ratio;
  }

  return {
    x: bounds.x + (bounds.w - w) / 2,
    y: bounds.y + (bounds.h - h) / 2,
    w,
    h,
  };
}

export function cropForAspect(ratio, bounds, center) {
  const base = defaultCrop(bounds, ratio, 0.9);
  if (!center) return base;
  return {
    ...base,
    x: clamp(center.x - base.w / 2, bounds.x, bounds.x + bounds.w - base.w),
    y: clamp(center.y - base.h / 2, bounds.y, bounds.y + bounds.h - base.h),
  };
}

export function moveCrop(start, dx, dy, bounds) {
  return {
    ...start,
    x: clamp(start.x + dx, bounds.x, bounds.x + bounds.w - start.w),
    y: clamp(start.y + dy, bounds.y, bounds.y + bounds.h - start.h),
  };
}

/**
 * Resize the crop rectangle from a handle. With an aspect ratio the
 * rectangle always keeps that ratio, anchored on the opposite handle.
 */
export function resizeCrop(handle, start, dx, dy, bounds, ratio, minSize = 24) {
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");

  const anchorX = west ? start.x + start.w : start.x;
  const anchorY = north ? start.y + start.h : start.y;
  const pointerX = west ? start.x + dx : start.x + start.w + dx;
  const pointerY = north ? start.y + dy : start.y + start.h + dy;

  const maxW = west ? anchorX - bounds.x : bounds.x + bounds.w - anchorX;
  const maxH = north ? anchorY - bounds.y : bounds.y + bounds.h - anchorY;
  const centerX = start.x + start.w / 2;
  const centerY = start.y + start.h / 2;

  let w = start.w;
  let h = start.h;
  let x = start.x;
  let y = start.y;

  if (west || east) {
    if (north || south) {
      /* corner */
      w = Math.max(minSize, Math.abs(pointerX - anchorX));
      h = Math.max(minSize, Math.abs(pointerY - anchorY));

      if (ratio) {
        const projected = Math.max(w, h * ratio);
        w = Math.min(projected, maxW, maxH * ratio);
        w = Math.max(minSize, w);
        h = w / ratio;
      } else {
        w = Math.min(w, maxW);
        h = Math.min(h, maxH);
      }

      x = west ? anchorX - w : anchorX;
      y = north ? anchorY - h : anchorY;
    } else {
      /* left / right edge */
      w = Math.max(minSize, Math.abs(pointerX - anchorX));
      if (ratio) {
        w = Math.min(w, maxW, maxH * ratio);
        w = Math.max(minSize, w);
        h = w / ratio;
        x = west ? anchorX - w : anchorX;
        y = centerY - h / 2;
      } else {
        w = Math.min(w, maxW);
        h = start.h;
        x = west ? anchorX - w : anchorX;
        y = start.y;
      }
    }
  } else if (north || south) {
    /* top / bottom edge */
    h = Math.max(minSize, Math.abs(pointerY - anchorY));
    if (ratio) {
      h = Math.min(h, maxH, maxW / ratio);
      h = Math.max(minSize, h);
      w = h * ratio;
      y = north ? anchorY - h : anchorY;
      x = centerX - w / 2;
    } else {
      h = Math.min(h, maxH);
      w = start.w;
      y = north ? anchorY - h : anchorY;
      x = start.x;
    }
  }

  x = clamp(x, bounds.x, Math.max(bounds.x, bounds.x + bounds.w - w));
  y = clamp(y, bounds.y, Math.max(bounds.y, bounds.y + bounds.h - h));

  return { x, y, w, h };
}

/**
 * Draw the source image into a canvas with rotation, straightening and
 * flips baked in. The returned canvas is the crop coordinate space.
 */
export function buildOrientedCanvas(image, transform = {}) {
  const { rotation = 0, straighten = 0, flipH = false, flipV = false } = transform;
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const radians = ((rotation + straighten) * Math.PI) / 180;

  const snap = (value) => {
    if (Math.abs(value) < 1e-9) return 0;
    if (Math.abs(value - 1) < 1e-9) return 1;
    if (Math.abs(value + 1) < 1e-9) return -1;
    return value;
  };

  const cos = Math.abs(snap(Math.cos(radians)));
  const sin = Math.abs(snap(Math.sin(radians)));
  const width = Math.max(1, Math.round(naturalWidth * cos + naturalHeight * sin));
  const height = Math.max(1, Math.round(naturalWidth * sin + naturalHeight * cos));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.translate(width / 2, height / 2);
  context.rotate(radians);
  context.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  context.drawImage(image, -naturalWidth / 2, -naturalHeight / 2);

  return canvas;
}

export function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        try {
          const dataUrl = canvas.toDataURL(type, quality);
          const [header, data] = dataUrl.split(",");
          const mime = header.match(/data:([^;]+)/)?.[1] || type;
          const binary = atob(data);
          const bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
          }
          resolve(new Blob([bytes], { type: mime }));
        } catch (error) {
          reject(error);
        }
      },
      type,
      quality,
    );
  });
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : decimals)} ${units[index]}`;
}

export function safeFileName(value, fallback = "cropped-image") {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || fallback
  );
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
