// app/(main)/tools-compo/tools/calendar-generator/CalendarPreview.jsx
"use client";

import React from "react";
import {
  MONTHS,
  DAYS_OF_WEEK,
  buildMonthMatrix,
  THEMES,
} from "./calendarData";

export default function CalendarPreview({
  settings,
  holidaysMap = {},
  customEventsMap = {},
  previewRef,
  onDayClick,
  zoomScale = 1,
}) {
  const {
    year = 2027,
    periodMode = "year", // 'year' | 'singleMonth' | 'customRange' | 'quarterly'
    singleMonth = 0,
    startMonth = 0,
    endMonth = 11,
    endYear = 2027,
    pageSize = "a4",
    customWidthMm = 210,
    customHeightMm = 297,
    orientation = "landscape", // 'portrait' | 'landscape'
    columns = 4,
    firstDayOfWeek = "sunday",
    showWeekNumbers = false,
    showMoonPhases = false,
    showDayOfYear = false,
    dayNameFormat = "short", // 'single' | 'short' | 'full'
    monthTitleFormat = "full", // 'full' | 'short' | 'withYear' | 'number'
    showTrailingDays = true,
    highlightWeekends = true,
    theme: themeKey = "nordicSlate",
    customColors = null,
    font = "inter",
    marginPreset = "standard", // 'none' | 'slim' | 'standard' | 'wide'
    customMarginMm = 12,
    title = "2027 Calendar",
    subtitle = "United States Federal Holidays & Observances",
    headerAlign = "center", // 'left' | 'center' | 'right'
    showBranding = true,
    brandingText = "ToolsTrek Calendar Studio",
    showNotes = false,
    notesType = "lines", // 'lines' | 'dots' | 'checkboxes' | 'blank'
    showHolidaysLegend = true,
    legendColumns = 3,
    roundness = "subtle", // 'sharp' | 'subtle' | 'soft'
    monthHeaderStyle = "banner", // 'banner' | 'underline' | 'minimal' | 'framed'
  } = settings;

  // Active theme with custom overrides if any
  const baseTheme = THEMES[themeKey] || THEMES.nordicSlate;
  const theme = customColors ? { ...baseTheme, ...customColors } : baseTheme;

  // Compute month list based on periodMode
  let monthsToRender = [];
  if (periodMode === "year") {
    for (let m = 0; m < 12; m++) {
      monthsToRender.push({ year, monthIndex: m });
    }
  } else if (periodMode === "singleMonth") {
    monthsToRender.push({ year, monthIndex: singleMonth });
  } else if (periodMode === "quarterly") {
    // 3 months around the chosen start
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

  // Margin calculation
  let paddingPx = 36;
  if (marginPreset === "none") paddingPx = 8;
  else if (marginPreset === "slim") paddingPx = 20;
  else if (marginPreset === "wide") paddingPx = 52;
  else if (marginPreset === "custom") paddingPx = Math.max(4, customMarginMm * 3.78);

  // Border radius tokens
  const radiusMap = {
    sharp: { outer: "0px", inner: "0px", badge: "2px" },
    subtle: { outer: "10px", inner: "6px", badge: "4px" },
    soft: { outer: "18px", inner: "10px", badge: "8px" },
  };
  const activeRadius = radiusMap[roundness] || radiusMap.subtle;

  // Days header list
  const daysHeader = DAYS_OF_WEEK[firstDayOfWeek] || DAYS_OF_WEEK.sunday;

  // Single month is special: give it a huge grid
  const isSingleMonth = periodMode === "singleMonth";

  // Compute holidays occurring within the rendered months for the legend
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

  return (
    <div
      className="calendar-preview-wrapper flex justify-center items-start w-full overflow-visible transition-transform duration-200"
      style={{
        transform: `scale(${zoomScale})`,
        transformOrigin: "top center",
      }}
    >
      {/* ── THE CALENDAR SHEET (Canvas / Print Target) ── */}
      <div
        id="calendar-print-sheet"
        ref={previewRef}
        className="calendar-sheet relative select-none shadow-2xl transition-all duration-300"
        style={{
          width: "100%",
          maxWidth: orientation === "landscape" ? "1200px" : "880px",
          minHeight: orientation === "landscape" ? "820px" : "1100px",
          backgroundColor: theme.paperBg,
          color: theme.dateColor,
          padding: `${paddingPx}px`,
          borderRadius: activeRadius.outer,
          border: `1px solid ${theme.borderColor}`,
          fontFamily:
            font === "playfair"
              ? "var(--font-playfairDisplay), 'Playfair Display', Georgia, serif"
              : font === "outfit"
              ? "'Outfit', sans-serif"
              : font === "robotoMono"
              ? "var(--font-mono), monospace"
              : font === "system"
              ? "system-ui, sans-serif"
              : "var(--font-sans), Inter, sans-serif",
          boxShadow: theme.isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* ── CALENDAR HEADER ── */}
        <header
          className="calendar-header mb-6 pb-4 border-b transition-colors"
          style={{
            borderColor: theme.borderColor,
            textAlign: headerAlign,
          }}
        >
          <div
            className={`flex flex-col ${
              headerAlign === "center"
                ? "items-center"
                : headerAlign === "right"
                ? "items-end"
                : "items-start"
            }`}
          >
            {/* Year / Period Pill Accent */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryText,
                }}
              >
                {periodMode === "singleMonth"
                  ? `${MONTHS[singleMonth].name} ${year}`
                  : periodMode === "customRange"
                  ? `${MONTHS[startMonth].short} ${year} – ${MONTHS[endMonth].short} ${endYear}`
                  : year}
              </span>
              {showWeekNumbers && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                  style={{
                    borderColor: theme.borderColor,
                    color: theme.accent,
                  }}
                >
                  ISO Weeks
                </span>
              )}
            </div>

            {/* Main Title */}
            <h1
              className="font-extrabold tracking-tight leading-tight"
              style={{
                fontSize: isSingleMonth ? "2.25rem" : "2rem",
                color: theme.headerText === "#ffffff" ? theme.primary : theme.dateColor,
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p
                className="mt-1 text-sm font-medium tracking-normal opacity-80"
                style={{ color: theme.dateColor }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </header>

        {/* ── MONTHS GRID ── */}
        <main
          className="calendar-months-grid grid gap-5 transition-all"
          style={{
            gridTemplateColumns: isSingleMonth
              ? "1fr"
              : `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {monthsToRender.map(({ year: mYear, monthIndex: mIdx }) => {
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

            // Month title format
            const mObj = MONTHS[mIdx];
            let displayTitle = mObj.name;
            if (monthTitleFormat === "short") displayTitle = mObj.short;
            else if (monthTitleFormat === "withYear") displayTitle = `${mObj.name} ${mYear}`;
            else if (monthTitleFormat === "number") displayTitle = `${String(mIdx + 1).padStart(2, "0")} / ${mObj.short.toUpperCase()}`;

            return (
              <div
                key={`${mYear}-${mIdx}`}
                className="month-card flex flex-col border transition-all"
                style={{
                  borderColor: theme.borderColor,
                  borderRadius: activeRadius.inner,
                  backgroundColor: theme.isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
                  overflow: "hidden",
                }}
              >
                {/* Month Title Header */}
                <div
                  className={`month-card-header px-3 py-2 flex items-center justify-between border-b ${
                    monthHeaderStyle === "banner"
                      ? "text-white"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      monthHeaderStyle === "banner"
                        ? theme.headerBg
                        : monthHeaderStyle === "minimal"
                        ? "transparent"
                        : theme.isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.02)",
                    color:
                      monthHeaderStyle === "banner"
                        ? theme.headerText
                        : theme.primary,
                    borderColor: theme.borderColor,
                  }}
                >
                  <span className="font-extrabold text-sm tracking-wide uppercase">
                    {displayTitle}
                  </span>
                  <span
                    className="text-xs font-semibold opacity-75"
                    style={{
                      color:
                        monthHeaderStyle === "banner"
                          ? theme.headerText
                          : theme.accent,
                    }}
                  >
                    {mYear}
                  </span>
                </div>

                {/* Days of Week Row */}
                <div
                  className="grid text-center font-bold text-[11px] py-1.5 border-b"
                  style={{
                    gridTemplateColumns: showWeekNumbers ? "26px repeat(7, 1fr)" : "repeat(7, 1fr)",
                    borderColor: theme.borderColor,
                    backgroundColor: theme.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    color: theme.isDark ? "#94a3b8" : "#475569",
                  }}
                >
                  {showWeekNumbers && (
                    <span className="text-[9px] font-semibold text-gray-400 flex items-center justify-center">
                      W#
                    </span>
                  )}
                  {daysHeader.map((d) => (
                    <span
                      key={d.id}
                      className={
                        highlightWeekends && d.isWeekend
                          ? "font-extrabold"
                          : ""
                      }
                      style={{
                        color:
                          highlightWeekends && d.isWeekend
                            ? theme.weekendText
                            : undefined,
                      }}
                    >
                      {dayNameFormat === "single"
                        ? d.letter
                        : dayNameFormat === "full"
                        ? d.full
                        : d.short}
                    </span>
                  ))}
                </div>

                {/* Month Days Grid */}
                <div className="flex flex-col divide-y divide-inherit" style={{ borderColor: theme.borderColor }}>
                  {matrix.map((week, wIdx) => (
                    <div
                      key={wIdx}
                      className="grid divide-x divide-inherit"
                      style={{
                        gridTemplateColumns: showWeekNumbers ? "26px repeat(7, 1fr)" : "repeat(7, 1fr)",
                        borderColor: theme.borderColor,
                        minHeight: isSingleMonth ? "88px" : "32px",
                      }}
                    >
                      {/* Week number */}
                      {showWeekNumbers && (
                        <div
                          className="flex items-center justify-center text-[10px] font-mono font-medium select-none"
                          style={{
                            color: theme.dimmedDateColor,
                            backgroundColor: theme.isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                          }}
                        >
                          {week.weekNumber}
                        </div>
                      )}

                      {/* 7 Days of Week */}
                      {week.days.map((dayItem, dIdx) => {
                        const {
                          day,
                          isCurrentMonth,
                          isWeekend,
                          holiday,
                          customEvent,
                          moonPhase,
                          dayOfYear,
                          dateKey,
                        } = dayItem;

                        const hasHoliday = !!holiday;
                        const hasCustom = !!customEvent;

                        // Background tint
                        let cellBg = "transparent";
                        if (isCurrentMonth) {
                          if (hasHoliday && !theme.isInkSaver) {
                            cellBg = theme.holidayBg;
                          } else if (isWeekend && highlightWeekends) {
                            cellBg = theme.weekendBg;
                          }
                        }

                        // Day text color
                        let textColor = theme.dateColor;
                        if (!isCurrentMonth) {
                          textColor = theme.dimmedDateColor;
                        } else if (hasHoliday) {
                          textColor = theme.holidayBadge;
                        } else if (isWeekend && highlightWeekends) {
                          textColor = theme.weekendText;
                        }

                        return (
                          <div
                            key={dIdx}
                            onClick={() => onDayClick && onDayClick(dayItem)}
                            className={`group relative flex flex-col justify-between p-1 transition-colors cursor-pointer hover:ring-2 hover:ring-brandColor/50 hover:z-10 ${
                              isSingleMonth ? "p-2" : "p-1"
                            }`}
                            style={{
                              backgroundColor: cellBg,
                              color: textColor,
                              visibility: !isCurrentMonth && !showTrailingDays ? "hidden" : "visible",
                            }}
                            title={
                              holiday
                                ? `${holiday.name} (${holiday.type})`
                                : customEvent
                                ? customEvent.name
                                : dateKey
                            }
                          >
                            {/* Day Header Row: Number + Moon + DOY */}
                            <div className="flex items-center justify-between w-full leading-none">
                              <span
                                className={`text-xs font-bold leading-none ${
                                  hasHoliday ? "font-black" : ""
                                }`}
                              >
                                {day}
                              </span>

                              <div className="flex items-center gap-1">
                                {moonPhase && (
                                  <span
                                    className="text-[10px] leading-none"
                                    title={moonPhase.name}
                                  >
                                    {moonPhase.icon}
                                  </span>
                                )}
                                {dayOfYear && (
                                  <span
                                    className="text-[8px] font-mono leading-none opacity-60"
                                    title={`Day ${dayOfYear} of ${year}`}
                                  >
                                    {dayOfYear}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Center / Bottom Badges & Events */}
                            <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                              {/* Holiday dot or label */}
                              {hasHoliday && (
                                <div
                                  className={`rounded-full flex items-center gap-1 ${
                                    isSingleMonth
                                      ? "px-1.5 py-0.5 text-[9px] font-semibold truncate"
                                      : "w-1.5 h-1.5 mx-auto"
                                  }`}
                                  style={{
                                    backgroundColor: theme.holidayBadge,
                                    color: "#ffffff",
                                  }}
                                  title={holiday.name}
                                >
                                  {isSingleMonth && (
                                    <span className="truncate">{holiday.name}</span>
                                  )}
                                </div>
                              )}

                              {/* Custom event badge */}
                              {hasCustom && (
                                <div
                                  className={`rounded-full flex items-center gap-1 ${
                                    isSingleMonth
                                      ? "px-1.5 py-0.5 text-[9px] font-bold text-white truncate"
                                      : "w-1.5 h-1.5 mx-auto rounded-full"
                                  }`}
                                  style={{
                                    backgroundColor: customEvent.color || theme.accent,
                                  }}
                                  title={customEvent.name}
                                >
                                  {isSingleMonth && (
                                    <span className="truncate">{customEvent.name}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>

        {/* ── PRINTABLE NOTES & CHECKLIST SECTION (Optional) ── */}
        {showNotes && (
          <section
            className="calendar-notes mt-6 pt-4 border-t"
            style={{ borderColor: theme.borderColor }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-xs uppercase tracking-widest opacity-80">
                Notes & Monthly Focus
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">ToolsTrek Planner</span>
            </div>

            {notesType === "lines" && (
              <div className="space-y-3 py-1">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="w-full border-b"
                    style={{ borderColor: theme.borderColor, height: "18px" }}
                  />
                ))}
              </div>
            )}

            {notesType === "checkboxes" && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-1">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 border rounded-sm flex-shrink-0"
                      style={{ borderColor: theme.borderColor }}
                    />
                    <div
                      className="w-full border-b"
                      style={{ borderColor: theme.borderColor, height: "14px" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {notesType === "dots" && (
              <div
                className="w-full h-16 rounded border"
                style={{
                  borderColor: theme.borderColor,
                  backgroundImage: `radial-gradient(${theme.borderColor} 1px, transparent 1px)`,
                  backgroundSize: "14px 14px",
                }}
              />
            )}

            {notesType === "blank" && (
              <div
                className="w-full h-16 rounded border"
                style={{ borderColor: theme.borderColor }}
              />
            )}
          </section>
        )}

        {/* ── HOLIDAYS & EVENTS LEGEND (Time & Date Signature Feature) ── */}
        {showHolidaysLegend && visibleHolidays.length > 0 && (
          <section
            className="calendar-legend mt-6 pt-4 border-t transition-colors"
            style={{ borderColor: theme.borderColor }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: theme.holidayBadge }}
                />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">
                  Holidays & Observances ({visibleHolidays.length})
                </h3>
              </div>
              <span className="text-[10px] opacity-70">
                Official Observance Schedule
              </span>
            </div>

            <div
              className="grid gap-x-6 gap-y-1.5 text-xs"
              style={{
                gridTemplateColumns: `repeat(${legendColumns}, minmax(0, 1fr))`,
              }}
            >
              {visibleHolidays.map((h, idx) => {
                const dateDisplay = `${MONTHS[h.month].short} ${h.day}`;
                return (
                  <div
                    key={`${h.dateKey}-${idx}`}
                    className="flex items-baseline gap-2 py-0.5 leading-snug"
                  >
                    <span
                      className="font-mono font-bold text-[11px] flex-shrink-0"
                      style={{
                        color: h.isCustom
                          ? h.color || theme.accent
                          : theme.holidayBadge,
                      }}
                    >
                      {dateDisplay}
                    </span>
                    <span className="truncate opacity-90" title={h.name}>
                      {h.name}
                    </span>
                    {h.isCustom && (
                      <span className="text-[9px] px-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold ml-auto flex-shrink-0">
                        Event
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── FOOTER / BRANDING ── */}
        <footer
          className="calendar-footer mt-6 pt-3 flex items-center justify-between text-[10px] font-medium border-t opacity-70"
          style={{ borderColor: theme.borderColor }}
        >
          <span>
            {showBranding ? brandingText : ""}
          </span>
          <span>
            {periodMode === "year" ? `Year ${year}` : `${title}`} • High-Resolution Print Ready
          </span>
        </footer>
      </div>
    </div>
  );
}
