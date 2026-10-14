// app/(main)/tools-compo/tools/CalendarGenerator.jsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import toolsData from "@/lib/toolsData.json";
import CalendarPreview from "./calendar-generator/CalendarPreview";
import {
  PAGE_SIZES,
  THEMES,
  FONT_OPTIONS,
  COUNTRIES,
  MONTHS,
  CALENDAR_PRESETS,
  convertToMm,
  convertFromMm,
  getHolidaysForYear,
  generateICS,
} from "./calendar-generator/calendarData";
import {
  generateVectorCalendarPDF,
  renderCalendarToCanvas,
} from "./calendar-generator/calendarExportEngine";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Settings2,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Palette,
  FileText,
  Globe,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileSpreadsheet,
  Moon,
  Sun,
  LayoutGrid,
  CheckCircle2,
  Layers,
  ArrowRightLeft,
  Info,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function CalendarGenerator() {
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // ─── Initial State & URL Param parsing ───
  const paramYear = parseInt(searchParams?.get("year"), 10);
  const initialYear = !isNaN(paramYear) && paramYear >= 1900 && paramYear <= 2100 ? paramYear : 2027;

  // ─── Settings State ───
  const [settings, setSettings] = useState({
    year: initialYear,
    periodMode: "year", // 'year' | 'singleMonth' | 'customRange' | 'quarterly'
    singleMonth: 0,
    startMonth: 0,
    endMonth: 11,
    endYear: initialYear,
    pageSize: "a4",
    customWidthVal: "210",
    customHeightVal: "297",
    customUnit: "mm", // 'mm' | 'in' | 'px'
    orientation: "landscape", // 'landscape' | 'portrait'
    columns: 4,
    firstDayOfWeek: "sunday", // 'sunday' | 'monday' | 'saturday'
    showWeekNumbers: false,
    showMoonPhases: false,
    showDayOfYear: false,
    dayNameFormat: "short", // 'single' | 'short' | 'full'
    monthTitleFormat: "full", // 'full' | 'short' | 'withYear' | 'number'
    showTrailingDays: true,
    highlightWeekends: true,
    theme: "nordicSlate",
    customColors: null,
    font: "inter",
    marginPreset: "standard", // 'none' | 'slim' | 'standard' | 'wide' | 'custom'
    customMarginMm: 12,
    country: "US",
    holidayCategories: { public: true, observance: true, religious: true },
    showHolidaysLegend: true,
    legendColumns: 3,
    title: `${initialYear} Calendar`,
    subtitle: "United States Federal Holidays & Observances",
    headerAlign: "center", // 'left' | 'center' | 'right'
    showBranding: true,
    brandingText: "ToolsTrek Calendar Studio",
    showNotes: false,
    notesType: "lines", // 'lines' | 'dots' | 'checkboxes' | 'blank'
    roundness: "subtle", // 'sharp' | 'subtle' | 'soft'
    monthHeaderStyle: "banner", // 'banner' | 'underline' | 'minimal' | 'framed'
  });

  // ─── Active Tab for Mobile / Desktop Settings Panel ───
  const [activeTab, setActiveTab] = useState("dates"); // 'dates' | 'page' | 'format' | 'holidays' | 'theme' | 'header' | 'presets'

  // ─── Custom Personal Events (LocalStorage) ───
  const [customEvents, setCustomEvents] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDayForEvent, setSelectedDayForEvent] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState("#3b82f6");

  // ─── UI & Export State ───
  const [zoomScale, setZoomScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(""); // 'pdf' | 'png' | 'jpeg' | 'print'
  const [exportQuality, setExportQuality] = useState(2); // 1x, 2x, 3x scale
  const [isCopied, setIsCopied] = useState(false);

  const previewRef = useRef(null);

  // Load custom events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("toolstrek_calendar_custom_events");
      if (stored) {
        setCustomEvents(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load local events", e);
    }
  }, []);

  // Save custom events to localStorage
  const saveCustomEvents = (events) => {
    setCustomEvents(events);
    try {
      localStorage.setItem("toolstrek_calendar_custom_events", JSON.stringify(events));
    } catch (e) {
      console.warn("Could not save local events", e);
    }
  };

  // Sync title when year changes if using default title
  const handleYearChange = (newYear) => {
    const validYear = Math.max(1900, Math.min(2100, newYear));
    setSettings((prev) => {
      const oldDefaultTitle = `${prev.year} Calendar`;
      const isDefaultTitle = prev.title === oldDefaultTitle || prev.title === "2027 Calendar";
      return {
        ...prev,
        year: validYear,
        endYear: prev.periodMode === "year" ? validYear : prev.endYear,
        title: isDefaultTitle ? `${validYear} Calendar` : prev.title,
      };
    });
  };

  // ─── Holiday Calculation ───
  const holidaysList = useMemo(() => {
    return getHolidaysForYear(settings.year, settings.country, settings.holidayCategories);
  }, [settings.year, settings.country, settings.holidayCategories]);

  const holidaysMap = useMemo(() => {
    const map = {};
    holidaysList.forEach((h) => {
      map[h.dateKey] = h;
    });
    return map;
  }, [holidaysList]);

  // ─── Custom Events Map ───
  const customEventsMap = useMemo(() => {
    const map = {};
    customEvents.forEach((ev) => {
      map[ev.dateKey] = ev;
    });
    return map;
  }, [customEvents]);

  // ─── Physical Dimensions in Millimeters ───
  const pageDimensionsMm = useMemo(() => {
    let wMm = 210;
    let hMm = 297;

    if (settings.pageSize === "custom") {
      wMm = convertToMm(settings.customWidthVal, settings.customUnit);
      hMm = convertToMm(settings.customHeightVal, settings.customUnit);
    } else {
      const preset = PAGE_SIZES.find((p) => p.id === settings.pageSize) || PAGE_SIZES[0];
      wMm = preset.widthMm;
      hMm = preset.heightMm;
    }

    if (settings.orientation === "landscape") {
      return {
        width: Math.max(wMm, hMm),
        height: Math.min(wMm, hMm),
      };
    } else {
      return {
        width: Math.min(wMm, hMm),
        height: Math.max(wMm, hMm),
      };
    }
  }, [
    settings.pageSize,
    settings.customWidthVal,
    settings.customHeightVal,
    settings.customUnit,
    settings.orientation,
  ]);

  // ─── Event Creation / Deletion ───
  const handleOpenAddEvent = (dayItem) => {
    if (!dayItem || !dayItem.isCurrentMonth) return;
    setSelectedDayForEvent(dayItem);
    setNewEventTitle("");
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e) => {
    e?.preventDefault();
    if (!newEventTitle.trim() || !selectedDayForEvent) return;

    const newEv = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dateKey: selectedDayForEvent.dateKey,
      year: selectedDayForEvent.year,
      month: selectedDayForEvent.month,
      day: selectedDayForEvent.day,
      name: newEventTitle.trim(),
      color: newEventColor,
    };

    const updated = [...customEvents, newEv];
    saveCustomEvents(updated);
    setIsEventModalOpen(false);
    toast.success(`Event added for ${MONTHS[newEv.month].short} ${newEv.day}! 🎉`);
  };

  const handleDeleteEvent = (id) => {
    const updated = customEvents.filter((ev) => ev.id !== id);
    saveCustomEvents(updated);
    toast.info("Event removed");
  };

  // ─── Swap Dimensions ───
  const handleSwapDimensions = () => {
    setSettings((prev) => ({
      ...prev,
      customWidthVal: prev.customHeightVal,
      customHeightVal: prev.customWidthVal,
      orientation: prev.orientation === "landscape" ? "portrait" : "landscape",
    }));
    toast.info("Swapped Width & Height");
  };

  // ─── Apply Preset ───
  const applyPreset = (preset) => {
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    toast.success(`Loaded "${preset.name}" preset!`);
  };

  // ─── High-Resolution Canvas Capture Helper ───
  const captureCanvas = async (scale = 2) => {
    const el = document.getElementById("calendar-print-sheet");
    if (!el) throw new Error("Calendar sheet element not found");

    const prevTransform = el.parentElement.style.transform;
    el.parentElement.style.transform = "none";

    try {
      const canvas = await html2canvas(el, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedSheet = clonedDoc.getElementById("calendar-print-sheet");
          if (clonedSheet) {
            clonedSheet.style.boxShadow = "none";
            clonedSheet.style.transform = "none";
          }
        },
      });
      return canvas;
    } finally {
      el.parentElement.style.transform = prevTransform;
    }
  };

  // ─── EXPORT: PDF (Native Vector + Canvas Fallback) ───
  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType("pdf");
    try {
      toast.loading("Generating vector print-ready PDF...", { id: "pdf-toast" });

      // Primary: Native high-precision vector PDF
      const doc = await generateVectorCalendarPDF({
        settings,
        holidaysMap,
        customEventsMap,
        pageDimensionsMm,
      });

      const safeTitle = (settings.title || "calendar")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      doc.save(`${safeTitle}-${settings.year}.pdf`);

      toast.success("PDF downloaded successfully! 📄", { id: "pdf-toast" });
    } catch (err) {
      console.error("Vector PDF error, activating canvas fallback:", err);
      try {
        const canvas = renderCalendarToCanvas({
          settings,
          holidaysMap,
          customEventsMap,
          pageDimensionsMm,
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdfOrientation = settings.orientation === "landscape" ? "l" : "p";
        const doc = new jsPDF({
          orientation: pdfOrientation,
          unit: "mm",
          format: [pageDimensionsMm.width, pageDimensionsMm.height],
        });
        doc.addImage(imgData, "PNG", 0, 0, pageDimensionsMm.width, pageDimensionsMm.height);
        const safeTitle = (settings.title || "calendar")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        doc.save(`${safeTitle}-${settings.year}.pdf`);
        toast.success("PDF downloaded successfully! 📄", { id: "pdf-toast" });
      } catch (fallbackErr) {
        console.error("PDF export fallback failed:", fallbackErr);
        toast.error("Failed to generate PDF. Please try again.", { id: "pdf-toast" });
      }
    } finally {
      setIsExporting(false);
      setExportType("");
    }
  };

  // ─── EXPORT: PNG / JPEG (High-Resolution Canvas) ───
  const handleExportImage = async (format = "png") => {
    setIsExporting(true);
    setExportType(format);
    try {
      toast.loading(`Rendering high-res ${format.toUpperCase()} (${exportQuality}x)...`, {
        id: "img-toast",
      });

      const canvas = renderCalendarToCanvas({
        settings,
        holidaysMap,
        customEventsMap,
        pageDimensionsMm,
        scale: exportQuality,
      });

      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      const dataUrl = canvas.toDataURL(mime, format === "jpeg" ? 0.95 : undefined);

      const safeTitle = (settings.title || "calendar")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${safeTitle}-${settings.year}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`${format.toUpperCase()} image downloaded! 🖼️`, { id: "img-toast" });
    } catch (err) {
      console.error("Image export error:", err);
      toast.error("Image generation failed. Please try again.", { id: "img-toast" });
    } finally {
      setIsExporting(false);
      setExportType("");
    }
  };

  // ─── EXPORT: Direct Browser Print ───
  const handleDirectPrint = () => {
    // Inject dynamic print page size rule
    const styleId = "dynamic-calendar-print-style";
    let existingStyle = document.getElementById(styleId);
    if (!existingStyle) {
      existingStyle = document.createElement("style");
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    const { width, height } = pageDimensionsMm;
    existingStyle.innerHTML = `
      @media print {
        @page {
          size: ${width}mm ${height}mm;
          margin: 0mm !important;
        }
        body * {
          visibility: hidden !important;
        }
        #calendar-print-sheet, #calendar-print-sheet * {
          visibility: visible !important;
        }
        #calendar-print-sheet {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          transform: none !important;
        }
      }
    `;

    setTimeout(() => {
      window.print();
    }, 100);
  };

  // ─── EXPORT: Copy Image to Clipboard ───
  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    try {
      toast.loading("Copying calendar image to clipboard...", { id: "copy-toast" });
      const canvas = renderCalendarToCanvas({
        settings,
        holidaysMap,
        customEventsMap,
        pageDimensionsMm,
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Clipboard copy not supported on this browser.", { id: "copy-toast" });
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setIsCopied(true);
          toast.success("Image copied to clipboard! Paste anywhere (Ctrl+V).", { id: "copy-toast" });
          setTimeout(() => setIsCopied(false), 2500);
        } catch (e) {
          console.warn("Direct blob copy failed, fallback", e);
          toast.error("Could not copy directly. Please use PNG Download instead.", { id: "copy-toast" });
        }
      }, "image/png");
    } catch (e) {
      console.error("Clipboard error:", e);
      toast.error("Failed to copy image to clipboard.", { id: "copy-toast" });
    } finally {
      setIsExporting(false);
    }
  };

  // ─── EXPORT: iCalendar (.ics) ───
  const handleExportICS = () => {
    const allEvents = [
      ...holidaysList,
      ...customEvents.map((ev) => ({
        year: ev.year,
        month: ev.month,
        day: ev.day,
        name: ev.name,
        type: "Custom Event",
      })),
    ];

    if (allEvents.length === 0) {
      toast.info("No holidays or custom events to export in .ics");
      return;
    }

    const icsContent = generateICS(allEvents, settings.title);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar-${settings.year}-events.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported .ICS calendar file! Import into Google Calendar or Apple Calendar.");
  };

  // ─── Zoom Controls ───
  const handleZoom = (delta) => {
    setZoomScale((prev) => Math.max(0.4, Math.min(2.0, parseFloat((prev + delta).toFixed(2)))));
  };

  const handleFitToScreen = () => {
    if (typeof window !== "undefined") {
      const containerWidth = window.innerWidth > 1024 ? window.innerWidth * 0.58 : window.innerWidth - 32;
      const sheetWidth = settings.orientation === "landscape" ? 1150 : 850;
      const calculated = Math.min(1.0, containerWidth / sheetWidth);
      setZoomScale(parseFloat(calculated.toFixed(2)));
      toast.info(`Adjusted zoom to ${Math.round(calculated * 100)}%`);
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-[1600px]">
      <div className="w-full space-y-6">
        {/* ── TOP NAV BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <BackButton className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer" />
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Print & Design Studio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  year: 2027,
                  periodMode: "year",
                  pageSize: "a4",
                  orientation: "landscape",
                  columns: 4,
                  firstDayOfWeek: "sunday",
                  theme: "nordicSlate",
                  country: "US",
                  title: "2027 Calendar",
                  subtitle: "United States Federal Holidays & Observances",
                }));
                toast.success("Reset to 2027 Defaults!");
              }}
              className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Reset to 2027 Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <FavoriteButton
              tool={
                toolsData.find((t) => t.link === "/tools/calendar-generator") || {
                  link: "/tools/calendar-generator",
                  title: "Custom Calendar Generator",
                }
              }
            />
          </div>
        </div>

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden border border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/60 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900 shadow-sm">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-brandColor/10 text-brandColor border border-brandColor/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Time & Date Custom Calendar Studio
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {pageDimensionsMm.width} × {pageDimensionsMm.height} mm
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarDays className="w-8 h-8 text-brandColor flex-shrink-0" />
                Custom Calendar Generator
              </h1>

              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                Design and download custom calendars for 2027 and beyond. Full year or multi-month, custom page sizes (A4, A3, Letter, custom mm/in), national holidays, custom events, moon phases, week numbers, designer themes, and crisp PDF & image export.
              </p>
            </div>

            {/* Quick Year Controls in Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleYearChange(settings.year - 1)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-white transition-colors cursor-pointer"
                  title="Previous Year"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-2xl px-3 py-0.5 text-brandColor">
                  {settings.year}
                </span>
                <button
                  onClick={() => handleYearChange(settings.year + 1)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-white transition-colors cursor-pointer"
                  title="Next Year"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Year Chips */}
              <div className="flex items-center gap-1">
                {[2025, 2026, 2027, 2028].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => handleYearChange(yr)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      settings.year === yr
                        ? "bg-brandColor text-white shadow-xs"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN STUDIO WORKSPACE (Split Sidebar + Canvas) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ════════════════════════════════════════════════════════
              LEFT PANEL: CUSTOMIZATION CONTROLS (5 cols on lg)
             ════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-5">
            {/* Control Tabs Navigation */}
            <div className="flex flex-wrap gap-1 p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold">
              {[
                { id: "dates", label: "Dates", icon: CalendarIcon },
                { id: "page", label: "Page Size", icon: LayoutGrid },
                { id: "format", label: "Format", icon: Sliders },
                { id: "holidays", label: "Holidays", icon: Globe },
                { id: "theme", label: "Themes", icon: Palette },
                { id: "header", label: "Header", icon: FileText },
                { id: "presets", label: "Presets", icon: Sparkles },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === id
                      ? "bg-white dark:bg-gray-800 text-brandColor shadow-xs font-extrabold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT CARDS */}
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-6">
              {/* ─── TAB 1: DATES & RANGE ─── */}
              {activeTab === "dates" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-brandColor" />
                        Calendar Period & Dates
                      </h2>
                      <p className="text-xs text-gray-500">Full year, multi-month, or single month</p>
                    </div>
                  </div>

                  {/* Period Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Period Mode
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                      {[
                        { id: "year", label: "Full Year (12m)" },
                        { id: "singleMonth", label: "Single Month" },
                        { id: "customRange", label: "Custom Range" },
                        { id: "quarterly", label: "Quarterly (3m)" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setSettings((s) => ({ ...s, periodMode: id }))}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            settings.periodMode === id
                              ? "bg-purple-50 dark:bg-purple-950/40 border-brandColor text-brandColor font-black shadow-xs"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Target Year
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        value={settings.year}
                        onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brandColor/50"
                      />
                      <button
                        onClick={() => handleYearChange(new Date().getFullYear())}
                        className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 whitespace-nowrap cursor-pointer"
                      >
                        This Year
                      </button>
                    </div>
                  </div>

                  {/* Single Month Picker if singleMonth mode */}
                  {settings.periodMode === "singleMonth" && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Select Month
                      </label>
                      <select
                        value={settings.singleMonth}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            singleMonth: parseInt(e.target.value, 10),
                            title: `${MONTHS[parseInt(e.target.value, 10)].name} ${s.year}`,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brandColor/50"
                      >
                        {MONTHS.map((m) => (
                          <option key={m.index} value={m.index}>
                            {m.name} ({m.days} days)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Custom Range Pickers */}
                  {settings.periodMode === "customRange" && (
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                          Start Month
                        </label>
                        <select
                          value={settings.startMonth}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, startMonth: parseInt(e.target.value, 10) }))
                          }
                          className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold"
                        >
                          {MONTHS.map((m) => (
                            <option key={m.index} value={m.index}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                          End Month
                        </label>
                        <select
                          value={settings.endMonth}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, endMonth: parseInt(e.target.value, 10) }))
                          }
                          className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold"
                        >
                          {MONTHS.map((m) => (
                            <option key={m.index} value={m.index}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Columns Count */}
                  {settings.periodMode !== "singleMonth" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Grid Layout Columns
                        </label>
                        <span className="text-xs font-mono font-bold text-brandColor">
                          {settings.columns} Columns
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {[1, 2, 3, 4, 6, 12].map((col) => (
                          <button
                            key={col}
                            onClick={() => setSettings((s) => ({ ...s, columns: col }))}
                            className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                              settings.columns === col
                                ? "bg-brandColor text-white border-brandColor shadow-xs"
                                : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {settings.orientation === "landscape"
                          ? "Tip: 4 columns looks best in Landscape (4×3 grid)."
                          : "Tip: 3 columns looks best in Portrait (3×4 grid)."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 2: PAGE SIZE & CUSTOM DIMENSIONS (Crucial Prompt Feature) ─── */}
              {activeTab === "page" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-brandColor" />
                        Page Size & Paper Dimensions
                      </h2>
                      <p className="text-xs text-gray-500">
                        Presets, exact millimeter/inch paper sizing, & custom dimensions
                      </p>
                    </div>
                  </div>

                  {/* Orientation Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Page Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            orientation: "landscape",
                            columns: s.columns === 3 ? 4 : s.columns,
                          }))
                        }
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          settings.orientation === "landscape"
                            ? "border-brandColor bg-purple-50 dark:bg-purple-950/40 text-brandColor font-bold shadow-xs"
                            : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-7 h-5 rounded border-2 border-current flex-shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold">Landscape</p>
                          <p className="text-[10px] opacity-70">Wide • 4×3 Wall layout</p>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            orientation: "portrait",
                            columns: s.columns === 4 ? 3 : s.columns,
                          }))
                        }
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          settings.orientation === "portrait"
                            ? "border-brandColor bg-purple-50 dark:bg-purple-950/40 text-brandColor font-bold shadow-xs"
                            : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-5 h-7 rounded border-2 border-current flex-shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold">Portrait</p>
                          <p className="text-[10px] opacity-70">Tall • 3×4 Planner format</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Page Size Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Standard Page Size Preset
                    </label>
                    <select
                      value={settings.pageSize}
                      onChange={(e) => setSettings((s) => ({ ...s, pageSize: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brandColor/50"
                    >
                      {PAGE_SIZES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.desc})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CUSTOM PAGE SIZE CONTROLS (If custom or custom input requested) */}
                  {settings.pageSize === "custom" && (
                    <div className="p-4 rounded-2xl border-2 border-brandColor/30 bg-purple-50/50 dark:bg-purple-950/20 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-brandColor uppercase tracking-wider">
                          Custom Dimensions
                        </span>
                        {/* Units Selector */}
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold">
                          {["mm", "in", "px"].map((u) => (
                            <button
                              key={u}
                              onClick={() => setSettings((s) => ({ ...s, customUnit: u }))}
                              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                                settings.customUnit === u
                                  ? "bg-brandColor text-white font-extrabold"
                                  : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                            Width ({settings.customUnit})
                          </label>
                          <input
                            type="number"
                            min="10"
                            step="any"
                            value={settings.customWidthVal}
                            onChange={(e) =>
                              setSettings((s) => ({ ...s, customWidthVal: e.target.value }))
                            }
                            className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                            Height ({settings.customUnit})
                          </label>
                          <input
                            type="number"
                            min="10"
                            step="any"
                            value={settings.customHeightVal}
                            onChange={(e) =>
                              setSettings((s) => ({ ...s, customHeightVal: e.target.value }))
                            }
                            className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-mono font-bold"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSwapDimensions}
                        className="w-full py-2 px-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 hover:bg-purple-100 text-brandColor text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Swap Width ↔ Height
                      </button>
                    </div>
                  )}

                  {/* Margins */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Page Margin Preset
                    </label>
                    <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                      {[
                        { id: "none", label: "None (0mm)" },
                        { id: "slim", label: "Slim (6mm)" },
                        { id: "standard", label: "Standard (12mm)" },
                        { id: "wide", label: "Wide (20mm)" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setSettings((s) => ({ ...s, marginPreset: id }))}
                          className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                            settings.marginPreset === id
                              ? "bg-brandColor text-white border-brandColor shadow-xs font-bold"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Dimension Info */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Physical Size (mm):</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {pageDimensionsMm.width} × {pageDimensionsMm.height} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Physical Size (inches):</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {(pageDimensionsMm.width / 25.4).toFixed(2)} ×{" "}
                        {(pageDimensionsMm.height / 25.4).toFixed(2)} in
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: FORMAT & TIME/DATE RULES ─── */}
              {activeTab === "format" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-brandColor" />
                        Calendar Formatting & Rules
                      </h2>
                      <p className="text-xs text-gray-500">
                        First day of week, week numbers, moon phases, & overflow days
                      </p>
                    </div>
                  </div>

                  {/* First Day of Week */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      First Day of the Week
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      {[
                        { id: "sunday", label: "Sunday (US, CA)" },
                        { id: "monday", label: "Monday (ISO, EU)" },
                        { id: "saturday", label: "Saturday (ME)" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setSettings((s) => ({ ...s, firstDayOfWeek: id }))}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            settings.firstDayOfWeek === id
                              ? "bg-brandColor text-white border-brandColor shadow-xs font-bold"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day Names Format */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Day Names Header Style
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      {[
                        { id: "single", label: "S M T W T F S" },
                        { id: "short", label: "Sun Mon Tue..." },
                        { id: "full", label: "Sunday Monday..." },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setSettings((s) => ({ ...s, dayNameFormat: id }))}
                          className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                            settings.dayNameFormat === id
                              ? "bg-brandColor text-white border-brandColor shadow-xs"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles Grid */}
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        key: "showWeekNumbers",
                        title: "Show Week Numbers (ISO 8601)",
                        desc: "Displays week number (W01, W02...) in left margin of each month",
                        icon: "📅",
                      },
                      {
                        key: "showMoonPhases",
                        title: "Show Moon Phases (🌑 🌓 🌕 🌗)",
                        desc: "Calculates astronomical lunar phases on exact occurrence days",
                        icon: "🌙",
                      },
                      {
                        key: "showDayOfYear",
                        title: "Show Day of the Year (1-365)",
                        desc: "Displays cumulative day counter for annual tracking",
                        icon: "🔢",
                      },
                      {
                        key: "highlightWeekends",
                        title: "Highlight Weekends (Sat & Sun)",
                        desc: "Gives weekend columns subtle accent tinting & styling",
                        icon: "🎨",
                      },
                      {
                        key: "showTrailingDays",
                        title: "Show Overflow / Trailing Days",
                        desc: "Faded dates from adjacent months instead of blank empty boxes",
                        icon: "👁️",
                      },
                    ].map(({ key, title, desc, icon }) => (
                      <label
                        key={key}
                        className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors cursor-pointer"
                      >
                        <span className="text-lg mt-0.5">{icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {title}
                          </p>
                          <p className="text-[11px] text-gray-500">{desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, [key]: e.target.checked }))
                          }
                          className="mt-1 w-4 h-4 rounded text-brandColor focus:ring-brandColor cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 4: HOLIDAYS & CUSTOM EVENTS ─── */}
              {activeTab === "holidays" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-brandColor" />
                        Holidays & Custom Events
                      </h2>
                      <p className="text-xs text-gray-500">
                        Country holidays, categories, and personal birthdays/events
                      </p>
                    </div>
                  </div>

                  {/* Country Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Country / Region Calendar
                    </label>
                    <select
                      value={settings.country}
                      onChange={(e) => setSettings((s) => ({ ...s, country: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brandColor/50"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Holiday Categories */}
                  {settings.country !== "NONE" && (
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Include Holiday Types
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "public", label: "Public Holidays" },
                          { id: "observance", label: "Observances" },
                          { id: "religious", label: "Religious / Festive" },
                        ].map(({ id, label }) => (
                          <label
                            key={id}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={settings.holidayCategories[id]}
                              onChange={(e) =>
                                setSettings((s) => ({
                                  ...s,
                                  holidayCategories: {
                                    ...s.holidayCategories,
                                    [id]: e.target.checked,
                                  },
                                }))
                              }
                              className="rounded text-brandColor focus:ring-brandColor"
                            />
                            <span className="truncate">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Holiday Legend at Bottom */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                      <span>Show Holiday Legend Box at Bottom</span>
                      <input
                        type="checkbox"
                        checked={settings.showHolidaysLegend}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, showHolidaysLegend: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-brandColor focus:ring-brandColor"
                      />
                    </label>

                    {settings.showHolidaysLegend && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500">Legend Columns:</span>
                        {[1, 2, 3, 4].map((c) => (
                          <button
                            key={c}
                            onClick={() => setSettings((s) => ({ ...s, legendColumns: c }))}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                              settings.legendColumns === c
                                ? "bg-brandColor text-white border-brandColor"
                                : "border-gray-200 dark:border-gray-800"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom Personal Events Builder */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                          Custom Events & Birthdays ({customEvents.length})
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Click any day on the calendar or add below
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDayForEvent({
                            dateKey: `${settings.year}-01-01`,
                            year: settings.year,
                            month: 0,
                            day: 1,
                            isCurrentMonth: true,
                          });
                          setNewEventTitle("");
                          setIsEventModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Event
                      </button>
                    </div>

                    {/* Saved Events List */}
                    {customEvents.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {customEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: ev.color || "#3b82f6" }}
                              />
                              <span className="font-mono font-bold text-gray-500">
                                {MONTHS[ev.month]?.short} {ev.day}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white truncate">
                                {ev.name}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-2">
                        No custom events added yet. Click any day on the calendar to mark birthdays, vacations, or meetings!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ─── TAB 5: THEMES & DESIGN ─── */}
              {activeTab === "theme" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-brandColor" />
                        Themes & Color Styling
                      </h2>
                      <p className="text-xs text-gray-500">
                        Curated designer palettes and typography choices
                      </p>
                    </div>
                  </div>

                  {/* Themes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.values(THEMES).map((th) => (
                      <button
                        key={th.id}
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            theme: th.id,
                            customColors: null,
                          }))
                        }
                        className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          settings.theme === th.id
                            ? "border-brandColor ring-2 ring-brandColor/20 shadow-sm"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: th.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: th.headerBg }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: th.holidayBadge }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {th.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Typography Font */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Typography Font Family
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSettings((s) => ({ ...s, font: f.id }))}
                          className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                            settings.font === f.id
                              ? "bg-brandColor text-white border-brandColor shadow-xs"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Roundness */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Corner Radius
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      {[
                        { id: "sharp", label: "Sharp (0px)" },
                        { id: "subtle", label: "Subtle (10px)" },
                        { id: "soft", label: "Soft (18px)" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setSettings((s) => ({ ...s, roundness: id }))}
                          className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                            settings.roundness === id
                              ? "bg-brandColor text-white border-brandColor shadow-xs"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 6: HEADER & NOTES ─── */}
              {activeTab === "header" && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brandColor" />
                        Header, Titles & Notes Area
                      </h2>
                      <p className="text-xs text-gray-500">
                        Customize calendar title, alignment, and printable note section
                      </p>
                    </div>
                  </div>

                  {/* Calendar Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Main Calendar Title
                    </label>
                    <input
                      type="text"
                      value={settings.title}
                      onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))}
                      placeholder="e.g. 2027 Calendar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brandColor/50"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Optional Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.subtitle}
                      onChange={(e) => setSettings((s) => ({ ...s, subtitle: e.target.value }))}
                      placeholder="e.g. Federal Holidays & Observances"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brandColor/50"
                    />
                  </div>

                  {/* Alignment */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Header Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      {[
                        { id: "left", label: "Left" },
                        { id: "center", label: "Center" },
                        { id: "right", label: "Right" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setSettings((s) => ({ ...s, headerAlign: id }))}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            settings.headerAlign === id
                              ? "bg-brandColor text-white border-brandColor shadow-xs"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Printable Notes Area */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white">
                          Printable Notes Box
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Adds writing space at the bottom for physical desk notes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showNotes}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, showNotes: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-brandColor focus:ring-brandColor cursor-pointer"
                      />
                    </div>

                    {settings.showNotes && (
                      <div className="grid grid-cols-4 gap-2 pt-2 text-xs font-bold">
                        {[
                          { id: "lines", label: "Lined Paper" },
                          { id: "checkboxes", label: "Checkboxes" },
                          { id: "dots", label: "Dot Grid" },
                          { id: "blank", label: "Blank Box" },
                        ].map(({ id, label }) => (
                          <button
                            key={id}
                            onClick={() => setSettings((s) => ({ ...s, notesType: id }))}
                            className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                              settings.notesType === id
                                ? "bg-brandColor text-white border-brandColor"
                                : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── TAB 7: PRESETS & QUICK TEMPLATES ─── */}
              {activeTab === "presets" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brandColor" />
                        Quick Setup Presets
                      </h2>
                      <p className="text-xs text-gray-500">
                        One-click pre-configured styles inspired by Time & Date
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {CALENDAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-brandColor/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-left transition-all cursor-pointer group flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-extrabold text-gray-900 dark:text-white group-hover:text-brandColor transition-colors">
                            {preset.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {preset.description}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-brandColor opacity-0 group-hover:opacity-100 transition-opacity">
                          Load →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── EXPORT ACTIONS PANEL ── */}
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-brandColor" />
                  Download & Export Calendar
                </span>
                {/* DPI / Quality selector */}
                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <span className="text-gray-400">Scale:</span>
                  {[
                    { val: 1, label: "1x" },
                    { val: 2, label: "2x" },
                    { val: 3, label: "3x (300DPI)" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setExportQuality(val)}
                      className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        exportQuality === val
                          ? "bg-brandColor text-white font-extrabold"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PDF Export */}
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="py-3 px-4 rounded-2xl bg-brandColor hover:bg-brandColorHover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-brandColor/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting && exportType === "pdf" ? "Exporting PDF..." : "Export as PDF"}
                </button>

                {/* PNG Image Export */}
                <button
                  onClick={() => handleExportImage("png")}
                  disabled={isExporting}
                  className="py-3 px-4 rounded-2xl border-2 border-brandColor text-brandColor hover:bg-purple-50 dark:hover:bg-purple-950/30 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting && exportType === "png" ? "Saving PNG..." : "Download PNG"}
                </button>
              </div>

              {/* Secondary Utility Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                <button
                  onClick={handleDirectPrint}
                  className="py-2.5 px-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  disabled={isExporting}
                  className="py-2.5 px-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {isCopied ? "Copied!" : "Copy"}
                </button>

                <button
                  onClick={() => handleExportImage("jpeg")}
                  disabled={isExporting}
                  className="py-2.5 px-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  JPEG
                </button>

                <button
                  onClick={handleExportICS}
                  className="py-2.5 px-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Export holidays & events into Google Calendar / Outlook"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  .ICS File
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              RIGHT PANEL: INTERACTIVE LIVE CANVAS (7 cols on lg)
             ════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-4">
            {/* Canvas Chrome Bar */}
            <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                  Live Print Canvas
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  ({pageDimensionsMm.width} × {pageDimensionsMm.height}mm • {settings.orientation})
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 font-mono text-[11px] text-gray-700 dark:text-gray-200 min-w-[42px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>

                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleFitToScreen}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Fit to Screen"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomScale(1)}
                  className="px-2 py-1 rounded-lg text-[10px] text-gray-500 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Canvas Viewport (Scrollable container with responsive paper drop) */}
            <div className="w-full overflow-x-auto overflow-y-visible py-6 px-2 sm:px-4 rounded-3xl bg-gray-100/80 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 min-h-[600px] flex justify-center items-start">
              <CalendarPreview
                settings={settings}
                holidaysMap={holidaysMap}
                customEventsMap={customEventsMap}
                previewRef={previewRef}
                onDayClick={handleOpenAddEvent}
                zoomScale={zoomScale}
              />
            </div>

            {/* Quick Interactive Tip Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">💡</span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Interactive Day Click:</strong> Click any day on the preview sheet to add birthdays, deadlines, or personal events!
                </p>
              </div>
              <button
                onClick={() => handleExportPDF()}
                className="font-extrabold text-brandColor hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Quick PDF Export →
              </button>
            </div>
          </div>
        </div>

        {/* ── ADD / VIEW CUSTOM EVENT MODAL ── */}
        {isEventModalOpen && selectedDayForEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Add Event for {MONTHS[selectedDayForEvent.month]?.name} {selectedDayForEvent.day}, {selectedDayForEvent.year}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Mark birthdays, anniversaries, deadlines, or meetings
                  </p>
                </div>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Existing Holiday on this day if any */}
              {holidaysMap[selectedDayForEvent.dateKey] && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs flex items-center gap-2">
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    Official Holiday:
                  </span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {holidaysMap[selectedDayForEvent.dateKey].name}
                  </span>
                </div>
              )}

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. Mom's Birthday, Team Offsite, Tax Deadline"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brandColor/50"
                  />
                </div>

                {/* Color Tag Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Event Color Tag
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { color: "#3b82f6", name: "Blue" },
                      { color: "#10b981", name: "Emerald" },
                      { color: "#f43f5e", name: "Rose" },
                      { color: "#f59e0b", name: "Amber" },
                      { color: "#8b5cf6", name: "Purple" },
                      { color: "#06b6d4", name: "Cyan" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setNewEventColor(c.color)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                          newEventColor === c.color ? "scale-125 ring-2 ring-offset-2 ring-brandColor" : ""
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-extrabold text-white bg-brandColor hover:bg-brandColorHover rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── KNOWLEDGE CARDS & FAQ SECTION ── */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Everything You Need in a Printable Calendar Generator
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Designed as the modern, high-resolution alternative to traditional calendar tools like Time and Date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "📐",
                title: "All Paper Formats & Custom Sizing",
                desc: "Choose from international ISO A4, A3, and A5, North American US Letter, Legal, and Tabloid, 16:9 desktop wallpaper, or input exact custom width and height in millimeters, inches, or pixels.",
              },
              {
                icon: "🌍",
                title: "Accurate Holidays & Astronomical Phases",
                desc: "Equipped with official public holidays for 10+ countries (USA, UK, Canada, Australia, Germany, France, India, Bangladesh, Japan, Brazil) plus real-time synodic moon phase calculations (New, Quarter, Full).",
              },
              {
                icon: "🖨️",
                title: "Print-Shop Ready PDF & High-Res Images",
                desc: "Export crisp vector-grade PDFs formatted directly to your chosen paper dimensions, or download 300 DPI high-resolution PNG images ideal for wall framing or home laser/inkjet printing.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 space-y-2 shadow-xs"
              >
                <span className="text-2xl">{icon}</span>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
