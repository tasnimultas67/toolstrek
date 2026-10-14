// app/(main)/tools-compo/tools/calendar-generator/calendarExportEngine.js
import { jsPDF } from "jspdf";
import {
  MONTHS,
  DAYS_OF_WEEK,
  buildMonthMatrix,
  THEMES,
} from "./calendarData.js";

// Helper: Convert hex color to [r, g, b]
export function hex2rgb(hexStr) {
  if (!hexStr) return [0, 0, 0];
  let h = hexStr.replace("#", "").trim();
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const num = parseInt(h, 16);
  if (isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// ─────────────────────────────────────────────────────────────
// 1. NATIVE VECTOR jsPDF EXPORT ENGINE (100% Crash-Proof)
// ─────────────────────────────────────────────────────────────
export async function generateVectorCalendarPDF({
  settings,
  holidaysMap = {},
  customEventsMap = {},
  pageDimensionsMm,
}) {
  const {
    year = 2027,
    periodMode = "year",
    singleMonth = 0,
    startMonth = 0,
    endMonth = 11,
    endYear = 2027,
    orientation = "landscape",
    columns: requestedCols = 4,
    firstDayOfWeek = "sunday",
    showWeekNumbers = false,
    showMoonPhases = false,
    showDayOfYear = false,
    dayNameFormat = "short",
    monthTitleFormat = "full",
    showTrailingDays = true,
    highlightWeekends = true,
    theme: themeKey = "nordicSlate",
    customColors = null,
    title = `${year} Calendar`,
    subtitle = "United States Federal Holidays & Observances",
    headerAlign = "center",
    showBranding = true,
    brandingText = "ToolsTrek Calendar Studio",
    showNotes = false,
    notesType = "lines",
    showHolidaysLegend = true,
    legendColumns = 3,
    customMarginMm = 12,
    marginPreset = "standard",
  } = settings;

  // Active theme
  const baseTheme = THEMES[themeKey] || THEMES.nordicSlate;
  const theme = customColors ? { ...baseTheme, ...customColors } : baseTheme;

  // Determine months to render
  let monthsToRender = [];
  if (periodMode === "year") {
    for (let m = 0; m < 12; m++) monthsToRender.push({ year, monthIndex: m });
  } else if (periodMode === "singleMonth") {
    monthsToRender.push({ year, monthIndex: singleMonth });
  } else if (periodMode === "quarterly") {
    for (let m = 0; m < 3; m++) {
      const actualMonth = (startMonth + m) % 12;
      const actualYear = startMonth + m >= 12 ? year + 1 : year;
      monthsToRender.push({ year: actualYear, monthIndex: actualMonth });
    }
  } else if (periodMode === "customRange") {
    let currY = year;
    let currM = startMonth;
    const targetY = endYear || year;
    const targetM = endMonth;
    let guard = 0;
    while (guard < 36) {
      monthsToRender.push({ year: currY, monthIndex: currM });
      if (currY === targetY && currM === targetM) break;
      currM++;
      if (currM > 11) {
        currM = 0;
        currY++;
      }
      guard++;
    }
  }

  // Page dimensions
  const pageW = Number(pageDimensionsMm?.width) || (orientation === "landscape" ? 297 : 210);
  const pageH = Number(pageDimensionsMm?.height) || (orientation === "landscape" ? 210 : 297);

  // Initialize jsPDF with exact millimeter dimensions
  const pdfOrientation = orientation === "landscape" ? "l" : "p";
  const doc = new jsPDF({
    orientation: pdfOrientation,
    unit: "mm",
    format: [pageW, pageH],
    compress: true,
  });

  // Calculate margins
  let margin = 10;
  if (marginPreset === "none") margin = 5;
  else if (marginPreset === "slim") margin = 7;
  else if (marginPreset === "wide") margin = 16;
  else if (marginPreset === "custom") margin = Math.max(4, customMarginMm);

  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  // Background Fill
  const [bgR, bgG, bgB] = hex2rgb(theme.paperBg);
  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(0, 0, pageW, pageH, "F");

  // ── HEADER ──
  let cursorY = margin + 2;

  // Pill badge above title
  const [primR, primG, primB] = hex2rgb(theme.primary);
  const [primTR, primTG, primTB] = hex2rgb(theme.primaryText);
  const badgeText = periodMode === "singleMonth"
    ? `${MONTHS[singleMonth].name} ${year}`.toUpperCase()
    : periodMode === "customRange"
    ? `${MONTHS[startMonth].short} ${year} - ${MONTHS[endMonth].short} ${endYear}`.toUpperCase()
    : `${year} ANNUAL CALENDAR`;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const badgeW = doc.getTextWidth(badgeText) + 6;
  let badgeX = margin;
  if (headerAlign === "center") badgeX = pageW / 2 - badgeW / 2;
  else if (headerAlign === "right") badgeX = pageW - margin - badgeW;

  doc.setFillColor(primR, primG, primB);
  doc.roundedRect(badgeX, cursorY, badgeW, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(primTR, primTG, primTB);
  doc.text(badgeText, badgeX + badgeW / 2, cursorY + 4, { align: "center" });

  cursorY += 9;

  // Title
  const [headTR, headTG, headTB] = hex2rgb(theme.isDark ? "#ffffff" : theme.primary);
  doc.setFontSize(periodMode === "singleMonth" ? 22 : 18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(headTR, headTG, headTB);

  let titleX = margin;
  if (headerAlign === "center") titleX = pageW / 2;
  else if (headerAlign === "right") titleX = pageW - margin;

  doc.text(title, titleX, cursorY, { align: headerAlign });
  cursorY += 6;

  // Subtitle
  if (subtitle) {
    const [subR, subG, subB] = hex2rgb(theme.isDark ? "#94a3b8" : "#475569");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(subR, subG, subB);
    doc.text(subtitle, titleX, cursorY, { align: headerAlign });
    cursorY += 5;
  }

  // Separator line
  const [brR, brG, brB] = hex2rgb(theme.borderColor);
  doc.setDrawColor(brR, brG, brB);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageW - margin, cursorY);
  cursorY += 4;

  // Collect visible holidays for legend
  const visibleHolidays = [];
  const holidayKeysSeen = new Set();
  monthsToRender.forEach(({ year: y, monthIndex: m }) => {
    const daysInM = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInM; d++) {
      const k = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (holidaysMap[k] && !holidayKeysSeen.has(k)) {
        holidayKeysSeen.add(k);
        visibleHolidays.push({ ...holidaysMap[k], isCustom: false });
      }
      if (customEventsMap[k] && !holidayKeysSeen.has(`custom-${k}`)) {
        holidayKeysSeen.add(`custom-${k}`);
        visibleHolidays.push({ ...customEventsMap[k], isCustom: true });
      }
    }
  });

  // Calculate bottom reservation (Footer, Legend, Notes)
  const footerH = 6; // branding line
  let legendH = 0;
  if (showHolidaysLegend && visibleHolidays.length > 0) {
    const cols = Math.max(1, legendColumns);
    const rows = Math.ceil(visibleHolidays.length / cols);
    legendH = Math.min(25, 6 + rows * 3.5);
  }

  let notesH = 0;
  if (showNotes) {
    notesH = 18;
  }

  const bottomReserved = footerH + legendH + notesH + (legendH > 0 || notesH > 0 ? 4 : 0);
  const availableGridH = pageH - margin - bottomReserved - cursorY;

  // Grid layout calculation
  const isSingle = periodMode === "singleMonth";
  const cols = isSingle ? 1 : Math.min(monthsToRender.length, requestedCols);
  const rows = isSingle ? 1 : Math.ceil(monthsToRender.length / cols);

  const colGap = isSingle ? 0 : 3.5;
  const rowGap = isSingle ? 0 : 3.5;

  const monthBoxW = (usableW - (cols - 1) * colGap) / cols;
  const monthBoxH = (availableGridH - (rows - 1) * rowGap) / rows;

  const daysHeader = DAYS_OF_WEEK[firstDayOfWeek] || DAYS_OF_WEEK.sunday;

  // ── DRAW MONTHS ──
  monthsToRender.forEach(({ year: mYear, monthIndex: mIdx }, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);

    const boxX = margin + colIdx * (monthBoxW + colGap);
    const boxY = cursorY + rowIdx * (monthBoxH + rowGap);

    // Month box outline
    doc.setDrawColor(brR, brG, brB);
    doc.setLineWidth(0.2);
    doc.setFillColor(bgR, bgG, bgB);
    doc.roundedRect(boxX, boxY, monthBoxW, monthBoxH, 1.5, 1.5, "FD");

    // Month header banner
    const bannerH = isSingle ? 10 : Math.min(7, monthBoxH * 0.16);
    const [hBgR, hBgG, hBgB] = hex2rgb(theme.headerBg);
    doc.setFillColor(hBgR, hBgG, hBgB);
    doc.roundedRect(boxX, boxY, monthBoxW, bannerH, 1.5, 1.5, "F");
    // Flatten bottom corners of banner
    doc.rect(boxX, boxY + bannerH - 1.5, monthBoxW, 1.5, "F");

    // Month Title text
    const [hTR, hTG, hTB] = hex2rgb(theme.headerText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(isSingle ? 13 : Math.min(8.5, bannerH * 1.1));
    doc.setTextColor(hTR, hTG, hTB);

    const mObj = MONTHS[mIdx];
    let mTitle = mObj.name.toUpperCase();
    if (monthTitleFormat === "short") mTitle = mObj.short.toUpperCase();
    else if (monthTitleFormat === "withYear") mTitle = `${mObj.name.toUpperCase()} ${mYear}`;
    else if (monthTitleFormat === "number") mTitle = `${String(mIdx + 1).padStart(2, "0")} / ${mObj.short.toUpperCase()}`;

    doc.text(mTitle, boxX + 3, boxY + bannerH / 2 + 1.2);
    doc.setFontSize(isSingle ? 10 : Math.min(7, bannerH * 0.9));
    doc.text(String(mYear), boxX + monthBoxW - 3, boxY + bannerH / 2 + 1.2, { align: "right" });

    // Day of week row
    const dowH = isSingle ? 6 : Math.min(4.5, (monthBoxH - bannerH) * 0.12);
    const dowY = boxY + bannerH;

    const [dowBgR, dowBgG, dowBgB] = hex2rgb(theme.isDark ? "#111827" : "#f8fafc");
    doc.setFillColor(dowBgR, dowBgG, dowBgB);
    doc.rect(boxX, dowY, monthBoxW, dowH, "F");
    doc.setDrawColor(brR, brG, brB);
    doc.line(boxX, dowY + dowH, boxX + monthBoxW, dowY + dowH);

    // Week numbers column width if active
    const weekColW = showWeekNumbers ? 3.5 : 0;
    const dayColW = (monthBoxW - weekColW) / 7;

    // Header labels
    doc.setFontSize(isSingle ? 8 : Math.min(6, dowH * 1.1));
    doc.setFont("helvetica", "bold");

    if (showWeekNumbers) {
      doc.setTextColor(150, 150, 150);
      doc.text("W#", boxX + weekColW / 2, dowY + dowH / 2 + 1, { align: "center" });
    }

    daysHeader.forEach((d, dIdx) => {
      const dX = boxX + weekColW + dIdx * dayColW + dayColW / 2;
      const isWeekend = highlightWeekends && d.isWeekend;
      const [wkR, wkG, wkB] = hex2rgb(isWeekend ? theme.weekendText : theme.isDark ? "#94a3b8" : "#475569");
      doc.setTextColor(wkR, wkG, wkB);

      let dLabel = d.short.slice(0, 2);
      if (dayNameFormat === "single") dLabel = d.letter;
      else if (dayNameFormat === "full" && isSingle) dLabel = d.full;
      else if (dayNameFormat === "short") dLabel = d.short;

      doc.text(dLabel, dX, dowY + dowH / 2 + 1, { align: "center" });
    });

    // ── Month Days Grid ──
    const matrix = buildMonthMatrix({
      year: mYear,
      monthIndex: mIdx,
      firstDayOfWeek,
      showTrailingDays,
      holidaysMap,
      customEventsMap,
      showMoonPhases,
      showDayOfYear,
    });

    const gridStartY = dowY + dowH;
    const rowH = (monthBoxH - bannerH - dowH) / 6;

    matrix.forEach((week, wIdx) => {
      const rY = gridStartY + wIdx * rowH;

      // Draw horizontal dividing line
      if (wIdx > 0) {
        doc.setDrawColor(brR, brG, brB);
        doc.setLineWidth(0.15);
        doc.line(boxX, rY, boxX + monthBoxW, rY);
      }

      // Week number
      if (showWeekNumbers) {
        doc.setFontSize(5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text(String(week.weekNumber), boxX + weekColW / 2, rY + rowH / 2 + 1, { align: "center" });
      }

      week.days.forEach((dayItem, dIdx) => {
        const cX = boxX + weekColW + dIdx * dayColW;

        if (!dayItem.isCurrentMonth && !showTrailingDays) return;

        // Background highlight for weekends or holidays
        if (dayItem.isCurrentMonth) {
          if (dayItem.holiday && !theme.isInkSaver) {
            const [hBgR2, hBgG2, hBgB2] = hex2rgb(theme.holidayBg);
            doc.setFillColor(hBgR2, hBgG2, hBgB2);
            doc.rect(cX, rY, dayColW, rowH, "F");
          } else if (dayItem.isWeekend && highlightWeekends) {
            const [wBgR, wBgG, wBgB] = hex2rgb(theme.weekendBg);
            doc.setFillColor(wBgR, wBgG, wBgB);
            doc.rect(cX, rY, dayColW, rowH, "F");
          }
        }

        // Day Number Text
        let textColorHex = theme.dateColor;
        if (!dayItem.isCurrentMonth) textColorHex = theme.dimmedDateColor;
        else if (dayItem.holiday) textColorHex = theme.holidayBadge;
        else if (dayItem.isWeekend && highlightWeekends) textColorHex = theme.weekendText;

        const [tColR, tColG, tColB] = hex2rgb(textColorHex);
        doc.setTextColor(tColR, tColG, tColB);
        doc.setFont("helvetica", dayItem.holiday ? "bold" : "normal");
        doc.setFontSize(isSingle ? 10 : Math.min(6.5, rowH * 0.9));

        if (isSingle) {
          // Large single month layout
          doc.text(String(dayItem.day), cX + 2, rY + 4);
          if (dayItem.holiday) {
            doc.setFontSize(5.5);
            doc.setFont("helvetica", "bold");
            doc.text(dayItem.holiday.name, cX + 2, rY + rowH - 2, { maxWidth: dayColW - 4 });
          } else if (dayItem.customEvent) {
            const [ceR, ceG, ceB] = hex2rgb(dayItem.customEvent.color || theme.accent);
            doc.setTextColor(ceR, ceG, ceB);
            doc.setFontSize(5.5);
            doc.text(dayItem.customEvent.name, cX + 2, rY + rowH - 2, { maxWidth: dayColW - 4 });
          }
          if (dayItem.moonPhase) {
            doc.setFontSize(6);
            doc.text(dayItem.moonPhase.symbol, cX + dayColW - 3, rY + 4, { align: "right" });
          }
        } else {
          // Standard multi-month layout
          doc.text(String(dayItem.day), cX + dayColW / 2, rY + rowH / 2 + 1, { align: "center" });

          // Dot indicator below date for holiday or custom event
          if (dayItem.holiday || dayItem.customEvent) {
            const dotColor = dayItem.holiday
              ? theme.holidayBadge
              : dayItem.customEvent?.color || theme.accent;
            const [dR, dG, dB] = hex2rgb(dotColor);
            doc.setFillColor(dR, dG, dB);
            doc.circle(cX + dayColW / 2, rY + rowH - 0.9, 0.45, "F");
          }

          // Moon phase symbol in corner
          if (dayItem.moonPhase && showMoonPhases) {
            doc.setFontSize(4);
            doc.text(dayItem.moonPhase.symbol, cX + dayColW - 1, rY + 2.5, { align: "right" });
          }
        }
      });
    });
  });

  // ── BOTTOM SECTION: NOTES (Optional) ──
  let bottomCursorY = pageH - margin - bottomReserved + 2;

  if (showNotes) {
    doc.setDrawColor(brR, brG, brB);
    doc.setLineWidth(0.2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(primR, primG, primB);
    doc.text("MONTHLY FOCUS & NOTES", margin, bottomCursorY + 3);

    const lineStartY = bottomCursorY + 4;
    for (let l = 0; l < 3; l++) {
      const lY = lineStartY + l * 4;
      doc.line(margin, lY, pageW - margin, lY);
    }
    bottomCursorY += notesH;
  }

  // ── BOTTOM SECTION: HOLIDAY LEGEND ──
  if (showHolidaysLegend && visibleHolidays.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const [hBadgeR, hBadgeG, hBadgeB] = hex2rgb(theme.holidayBadge);
    doc.setTextColor(hBadgeR, hBadgeG, hBadgeB);
    doc.text(`HOLIDAYS & EVENTS (${visibleHolidays.length})`, margin, bottomCursorY + 2.5);

    const legCols = Math.max(1, legendColumns);
    const legColW = usableW / legCols;
    const legStartY = bottomCursorY + 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);

    visibleHolidays.forEach((h, idx) => {
      const colI = idx % legCols;
      const rowI = Math.floor(idx / legCols);
      const lX = margin + colI * legColW;
      const lY = legStartY + rowI * 3.2;

      const dateStr = `${MONTHS[h.month]?.short} ${String(h.day).padStart(2, "0")}`;
      doc.setFont("helvetica", "bold");
      const [colR, colG, colB] = hex2rgb(h.isCustom ? h.color || theme.accent : theme.holidayBadge);
      doc.setTextColor(colR, colG, colB);
      doc.text(dateStr, lX, lY);

      doc.setFont("helvetica", "normal");
      const [txR, txG, txB] = hex2rgb(theme.isDark ? "#cbd5e1" : "#334155");
      doc.setTextColor(txR, txG, txB);
      doc.text(h.name, lX + 11, lY, { maxWidth: legColW - 12 });
    });
  }

  // ── FOOTER: BRANDING & PAGE INFO ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  if (showBranding) {
    doc.text(brandingText, margin, pageH - margin + 3);
  }
  doc.text(
    `${year} Calendar • High-Resolution Print Ready • ToolsTrek`,
    pageW - margin,
    pageH - margin + 3,
    { align: "right" }
  );

  return doc;
}

// ─────────────────────────────────────────────────────────────
// 2. NATIVE HTML5 CANVAS 2D RENDERER (For High-Res PNG & JPEG)
// ─────────────────────────────────────────────────────────────
export function renderCalendarToCanvas({
  settings,
  holidaysMap = {},
  customEventsMap = {},
  pageDimensionsMm,
  scale = 2,
}) {
  const {
    year = 2027,
    periodMode = "year",
    singleMonth = 0,
    startMonth = 0,
    endMonth = 11,
    endYear = 2027,
    orientation = "landscape",
    columns: requestedCols = 4,
    firstDayOfWeek = "sunday",
    showWeekNumbers = false,
    showMoonPhases = false,
    showDayOfYear = false,
    dayNameFormat = "short",
    monthTitleFormat = "full",
    showTrailingDays = true,
    highlightWeekends = true,
    theme: themeKey = "nordicSlate",
    customColors = null,
    title = `${year} Calendar`,
    subtitle = "United States Federal Holidays & Observances",
    headerAlign = "center",
    showBranding = true,
    brandingText = "ToolsTrek Calendar Studio",
    showNotes = false,
    notesType = "lines",
    showHolidaysLegend = true,
    legendColumns = 3,
    customMarginMm = 12,
    marginPreset = "standard",
  } = settings;

  const baseTheme = THEMES[themeKey] || THEMES.nordicSlate;
  const theme = customColors ? { ...baseTheme, ...customColors } : baseTheme;

  // Physical pixel conversion: 1mm = 3.779528 px at 96 DPI
  const PX_PER_MM = 3.779528;
  const pageW_mm = Number(pageDimensionsMm?.width) || (orientation === "landscape" ? 297 : 210);
  const pageH_mm = Number(pageDimensionsMm?.height) || (orientation === "landscape" ? 210 : 297);

  const canvasW = Math.round(pageW_mm * PX_PER_MM * scale);
  const canvasH = Math.round(pageH_mm * PX_PER_MM * scale);

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");

  // Apply scale
  ctx.scale(scale * PX_PER_MM, scale * PX_PER_MM);

  // Margins in mm
  let margin = 10;
  if (marginPreset === "none") margin = 5;
  else if (marginPreset === "slim") margin = 7;
  else if (marginPreset === "wide") margin = 16;
  else if (marginPreset === "custom") margin = Math.max(4, customMarginMm);

  const usableW = pageW_mm - margin * 2;
  const usableH = pageH_mm - margin * 2;

  // Background
  ctx.fillStyle = theme.paperBg;
  ctx.fillRect(0, 0, pageW_mm, pageH_mm);

  let cursorY = margin + 2;

  // Header Pill
  const badgeText = periodMode === "singleMonth"
    ? `${MONTHS[singleMonth].name} ${year}`.toUpperCase()
    : periodMode === "customRange"
    ? `${MONTHS[startMonth].short} ${year} - ${MONTHS[endMonth].short} ${endYear}`.toUpperCase()
    : `${year} ANNUAL CALENDAR`;

  ctx.font = "bold 3mm Inter, sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 6;
  let badgeX = margin;
  if (headerAlign === "center") badgeX = pageW_mm / 2 - badgeW / 2;
  else if (headerAlign === "right") badgeX = pageW_mm - margin - badgeW;

  ctx.fillStyle = theme.primary;
  ctx.beginPath();
  ctx.roundRect(badgeX, cursorY, badgeW, 5.5, 1.5);
  ctx.fill();

  ctx.fillStyle = theme.primaryText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, badgeX + badgeW / 2, cursorY + 2.8);

  cursorY += 9;

  // Main Title
  ctx.fillStyle = theme.isDark ? "#ffffff" : theme.primary;
  ctx.font = `bold ${periodMode === "singleMonth" ? "7mm" : "6mm"} Inter, sans-serif`;
  ctx.textAlign = headerAlign;
  ctx.textBaseline = "alphabetic";

  let titleX = margin;
  if (headerAlign === "center") titleX = pageW_mm / 2;
  else if (headerAlign === "right") titleX = pageW_mm - margin;

  ctx.fillText(title, titleX, cursorY + 4);
  cursorY += 6;

  // Subtitle
  if (subtitle) {
    ctx.fillStyle = theme.isDark ? "#94a3b8" : "#475569";
    ctx.font = "normal 3mm Inter, sans-serif";
    ctx.fillText(subtitle, titleX, cursorY + 3);
    cursorY += 5;
  }

  // Header separator
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(margin, cursorY);
  ctx.lineTo(pageW_mm - margin, cursorY);
  ctx.stroke();
  cursorY += 4;

  // Months preparation
  let monthsToRender = [];
  if (periodMode === "year") {
    for (let m = 0; m < 12; m++) monthsToRender.push({ year, monthIndex: m });
  } else if (periodMode === "singleMonth") {
    monthsToRender.push({ year, monthIndex: singleMonth });
  } else if (periodMode === "quarterly") {
    for (let m = 0; m < 3; m++) {
      const actualMonth = (startMonth + m) % 12;
      const actualYear = startMonth + m >= 12 ? year + 1 : year;
      monthsToRender.push({ year: actualYear, monthIndex: actualMonth });
    }
  } else if (periodMode === "customRange") {
    let currY = year;
    let currM = startMonth;
    const targetY = endYear || year;
    const targetM = endMonth;
    let guard = 0;
    while (guard < 36) {
      monthsToRender.push({ year: currY, monthIndex: currM });
      if (currY === targetY && currM === targetM) break;
      currM++;
      if (currM > 11) {
        currM = 0;
        currY++;
      }
      guard++;
    }
  }

  const visibleHolidays = [];
  const holidayKeysSeen = new Set();
  monthsToRender.forEach(({ year: y, monthIndex: m }) => {
    const daysInM = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInM; d++) {
      const k = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (holidaysMap[k] && !holidayKeysSeen.has(k)) {
        holidayKeysSeen.add(k);
        visibleHolidays.push({ ...holidaysMap[k], isCustom: false });
      }
      if (customEventsMap[k] && !holidayKeysSeen.has(`custom-${k}`)) {
        holidayKeysSeen.add(`custom-${k}`);
        visibleHolidays.push({ ...customEventsMap[k], isCustom: true });
      }
    }
  });

  const footerH = 6;
  let legendH = 0;
  if (showHolidaysLegend && visibleHolidays.length > 0) {
    const cols = Math.max(1, legendColumns);
    const rows = Math.ceil(visibleHolidays.length / cols);
    legendH = Math.min(25, 6 + rows * 3.5);
  }

  let notesH = showNotes ? 18 : 0;
  const bottomReserved = footerH + legendH + notesH + (legendH > 0 || notesH > 0 ? 4 : 0);
  const availableGridH = pageH_mm - margin - bottomReserved - cursorY;

  const isSingle = periodMode === "singleMonth";
  const cols = isSingle ? 1 : Math.min(monthsToRender.length, requestedCols);
  const rows = isSingle ? 1 : Math.ceil(monthsToRender.length / cols);
  const colGap = isSingle ? 0 : 3.5;
  const rowGap = isSingle ? 0 : 3.5;
  const monthBoxW = (usableW - (cols - 1) * colGap) / cols;
  const monthBoxH = (availableGridH - (rows - 1) * rowGap) / rows;

  const daysHeader = DAYS_OF_WEEK[firstDayOfWeek] || DAYS_OF_WEEK.sunday;

  // Draw each month box
  monthsToRender.forEach(({ year: mYear, monthIndex: mIdx }, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);

    const boxX = margin + colIdx * (monthBoxW + colGap);
    const boxY = cursorY + rowIdx * (monthBoxH + rowGap);

    // Box card outline
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 0.25;
    ctx.fillStyle = theme.isDark ? "#0f172a" : "#ffffff";
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, monthBoxW, monthBoxH, 1.5);
    ctx.fill();
    ctx.stroke();

    // Banner
    const bannerH = isSingle ? 10 : Math.min(7, monthBoxH * 0.16);
    ctx.fillStyle = theme.headerBg;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, monthBoxW, bannerH, [1.5, 1.5, 0, 0]);
    ctx.fill();

    // Banner Text
    ctx.fillStyle = theme.headerText;
    ctx.font = `bold ${isSingle ? "4mm" : "2.6mm"} Inter, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const mObj = MONTHS[mIdx];
    let mTitle = mObj.name.toUpperCase();
    if (monthTitleFormat === "short") mTitle = mObj.short.toUpperCase();
    else if (monthTitleFormat === "withYear") mTitle = `${mObj.name.toUpperCase()} ${mYear}`;
    else if (monthTitleFormat === "number") mTitle = `${String(mIdx + 1).padStart(2, "0")} / ${mObj.short.toUpperCase()}`;

    ctx.fillText(mTitle, boxX + 2.5, boxY + bannerH / 2);
    ctx.textAlign = "right";
    ctx.fillText(String(mYear), boxX + monthBoxW - 2.5, boxY + bannerH / 2);

    // Day of week row
    const dowH = isSingle ? 6 : Math.min(4.5, (monthBoxH - bannerH) * 0.12);
    const dowY = boxY + bannerH;

    ctx.fillStyle = theme.isDark ? "#111827" : "#f8fafc";
    ctx.fillRect(boxX, dowY, monthBoxW, dowH);
    ctx.strokeStyle = theme.borderColor;
    ctx.beginPath();
    ctx.moveTo(boxX, dowY + dowH);
    ctx.lineTo(boxX + monthBoxW, dowY + dowH);
    ctx.stroke();

    const weekColW = showWeekNumbers ? 3.5 : 0;
    const dayColW = (monthBoxW - weekColW) / 7;

    ctx.textAlign = "center";
    ctx.font = `bold ${isSingle ? "2.5mm" : "2mm"} Inter, sans-serif`;

    if (showWeekNumbers) {
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("W#", boxX + weekColW / 2, dowY + dowH / 2);
    }

    daysHeader.forEach((d, dIdx) => {
      const dX = boxX + weekColW + dIdx * dayColW + dayColW / 2;
      const isWeekend = highlightWeekends && d.isWeekend;
      ctx.fillStyle = isWeekend ? theme.weekendText : theme.isDark ? "#94a3b8" : "#475569";
      let dLabel = d.short.slice(0, 2);
      if (dayNameFormat === "single") dLabel = d.letter;
      else if (dayNameFormat === "full" && isSingle) dLabel = d.full;
      else if (dayNameFormat === "short") dLabel = d.short;
      ctx.fillText(dLabel, dX, dowY + dowH / 2);
    });

    // Days grid
    const matrix = buildMonthMatrix({
      year: mYear,
      monthIndex: mIdx,
      firstDayOfWeek,
      showTrailingDays,
      holidaysMap,
      customEventsMap,
      showMoonPhases,
      showDayOfYear,
    });

    const gridStartY = dowY + dowH;
    const rowH = (monthBoxH - bannerH - dowH) / 6;

    matrix.forEach((week, wIdx) => {
      const rY = gridStartY + wIdx * rowH;

      if (wIdx > 0) {
        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 0.15;
        ctx.beginPath();
        ctx.moveTo(boxX, rY);
        ctx.lineTo(boxX + monthBoxW, rY);
        ctx.stroke();
      }

      if (showWeekNumbers) {
        ctx.fillStyle = "#9ca3af";
        ctx.font = "normal 1.8mm Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(week.weekNumber), boxX + weekColW / 2, rY + rowH / 2);
      }

      week.days.forEach((dayItem, dIdx) => {
        const cX = boxX + weekColW + dIdx * dayColW;
        if (!dayItem.isCurrentMonth && !showTrailingDays) return;

        // Background highlight
        if (dayItem.isCurrentMonth) {
          if (dayItem.holiday && !theme.isInkSaver) {
            ctx.fillStyle = theme.holidayBg;
            ctx.fillRect(cX, rY, dayColW, rowH);
          } else if (dayItem.isWeekend && highlightWeekends) {
            ctx.fillStyle = theme.weekendBg;
            ctx.fillRect(cX, rY, dayColW, rowH);
          }
        }

        // Text color
        let textColor = theme.dateColor;
        if (!dayItem.isCurrentMonth) textColor = theme.dimmedDateColor;
        else if (dayItem.holiday) textColor = theme.holidayBadge;
        else if (dayItem.isWeekend && highlightWeekends) textColor = theme.weekendText;

        ctx.fillStyle = textColor;
        ctx.font = `${dayItem.holiday ? "bold" : "normal"} ${isSingle ? "3.5mm" : "2.4mm"} Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(dayItem.day), cX + dayColW / 2, rY + rowH / 2);

        // Dot for holiday or custom event
        if (dayItem.holiday || dayItem.customEvent) {
          ctx.fillStyle = dayItem.holiday ? theme.holidayBadge : dayItem.customEvent?.color || theme.accent;
          ctx.beginPath();
          ctx.arc(cX + dayColW / 2, rY + rowH - 1, 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        // Moon phase symbol
        if (dayItem.moonPhase && showMoonPhases) {
          ctx.font = "normal 1.8mm sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(dayItem.moonPhase.symbol, cX + dayColW - 0.8, rY + 1.8);
        }
      });
    });
  });

  // Bottom Legend
  let bottomCursorY = pageH_mm - margin - bottomReserved + 2;

  if (showNotes) {
    ctx.fillStyle = theme.primary;
    ctx.font = "bold 2.4mm Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("MONTHLY FOCUS & NOTES", margin, bottomCursorY + 2.5);

    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 0.2;
    for (let l = 0; l < 3; l++) {
      const lY = bottomCursorY + 4.5 + l * 4;
      ctx.beginPath();
      ctx.moveTo(margin, lY);
      ctx.lineTo(pageW_mm - margin, lY);
      ctx.stroke();
    }
    bottomCursorY += notesH;
  }

  if (showHolidaysLegend && visibleHolidays.length > 0) {
    ctx.fillStyle = theme.holidayBadge;
    ctx.font = "bold 2.4mm Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`HOLIDAYS & EVENTS (${visibleHolidays.length})`, margin, bottomCursorY + 2.5);

    const legCols = Math.max(1, legendColumns);
    const legColW = usableW / legCols;
    const legStartY = bottomCursorY + 5;

    visibleHolidays.forEach((h, idx) => {
      const colI = idx % legCols;
      const rowI = Math.floor(idx / legCols);
      const lX = margin + colI * legColW;
      const lY = legStartY + rowI * 3.2;

      ctx.fillStyle = h.isCustom ? h.color || theme.accent : theme.holidayBadge;
      ctx.font = "bold 2mm monospace";
      const dateStr = `${MONTHS[h.month]?.short} ${String(h.day).padStart(2, "0")}`;
      ctx.fillText(dateStr, lX, lY);

      ctx.fillStyle = theme.isDark ? "#cbd5e1" : "#334155";
      ctx.font = "normal 2mm Inter, sans-serif";
      ctx.fillText(h.name, lX + 11, lY);
    });
  }

  // Footer branding
  ctx.fillStyle = "#9ca3af";
  ctx.font = "normal 2mm Inter, sans-serif";
  ctx.textAlign = "left";
  if (showBranding) {
    ctx.fillText(brandingText, margin, pageH_mm - margin + 3);
  }
  ctx.textAlign = "right";
  ctx.fillText(
    `${year} Calendar • High-Resolution Print Ready • ToolsTrek`,
    pageW_mm - margin,
    pageH_mm - margin + 3
  );

  return canvas;
}
