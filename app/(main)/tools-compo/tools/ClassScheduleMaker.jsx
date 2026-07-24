"use client";
import React, { useState, useRef, useCallback } from "react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIMES = Array.from({ length: 29 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const min = i % 2 === 0 ? "00" : "30";
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  return { value: `${String(hour).padStart(2, "0")}:${min}`, label: `${h12}:${min} ${ampm}` };
});

const CLASS_COLORS = [
  { id: "blue", bg: "#3b82f6", light: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  { id: "purple", bg: "#8b5cf6", light: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  { id: "rose", bg: "#f43f5e", light: "#fff1f2", text: "#be123c", border: "#fecdd3" },
  { id: "amber", bg: "#f59e0b", light: "#fffbeb", text: "#b45309", border: "#fde68a" },
  { id: "emerald", bg: "#10b981", light: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  { id: "sky", bg: "#0ea5e9", light: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
  { id: "orange", bg: "#f97316", light: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  { id: "pink", bg: "#ec4899", light: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  { id: "indigo", bg: "#6366f1", light: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  { id: "teal", bg: "#14b8a6", light: "#f0fdfa", text: "#0f766e", border: "#99f6e4" },
  { id: "lime", bg: "#84cc16", light: "#f7fee7", text: "#4d7c0f", border: "#d9f99d" },
  { id: "cyan", bg: "#06b6d4", light: "#ecfeff", text: "#0e7490", border: "#a5f3fc" },
];

const SEMESTER_TYPES = ["Fall", "Spring", "Summer", "Quarter", "Year"];
const FONTS = ["Inter", "Roboto", "Poppins", "Outfit", "DM Sans"];

const THEMES = {
  modern: { name: "Modern Dark", bg: "#0f172a", headerBg: "#1e293b", cellBg: "#1e293b", cellBg2: "#0f172a", borderColor: "#334155", textPrimary: "#f1f5f9", textSecondary: "#94a3b8", timeColor: "#64748b", isDark: true },
  light: { name: "Clean Light", bg: "#f8fafc", headerBg: "#ffffff", cellBg: "#ffffff", cellBg2: "#f8fafc", borderColor: "#e2e8f0", textPrimary: "#0f172a", textSecondary: "#64748b", timeColor: "#94a3b8", isDark: false },
  minimal: { name: "Minimal", bg: "#ffffff", headerBg: "#f9fafb", cellBg: "#ffffff", cellBg2: "#f9fafb", borderColor: "#f3f4f6", textPrimary: "#111827", textSecondary: "#6b7280", timeColor: "#d1d5db", isDark: false },
  ocean: { name: "Ocean", bg: "#0c1a2e", headerBg: "#0f2744", cellBg: "#0f2744", cellBg2: "#0c1a2e", borderColor: "#1e3a5f", textPrimary: "#e0f2fe", textSecondary: "#7dd3fc", timeColor: "#38bdf8", isDark: true },
  forest: { name: "Forest", bg: "#0d1f13", headerBg: "#132a1a", cellBg: "#132a1a", cellBg2: "#0d1f13", borderColor: "#1d4a28", textPrimary: "#dcfce7", textSecondary: "#86efac", timeColor: "#4ade80", isDark: true },
  sunset: { name: "Sunset", bg: "#1c0c1e", headerBg: "#2d0f31", cellBg: "#2d0f31", cellBg2: "#1c0c1e", borderColor: "#4a1854", textPrimary: "#fdf4ff", textSecondary: "#e879f9", timeColor: "#c026d3", isDark: true },
};

const DEFAULT_SETTINGS = {
  title: "My Class Schedule",
  subtitle: "Spring 2025",
  semesterType: "Spring",
  showWeekend: false,
  startTime: "08:00",
  endTime: "20:00",
  slotHeight: 60,
  theme: "modern",
  showRoom: true,
  showProfessor: true,
  showCredits: false,
  font: "Inter",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function formatTime12(t) {
  const [h, m] = t.split(":").map(Number);
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const SAMPLE_CLASSES = [
  { id: uid(), name: "Calculus II", code: "MATH 201", professor: "Dr. Smith", room: "Hall A-201", days: ["Monday", "Wednesday", "Friday"], startTime: "09:00", endTime: "10:00", color: "blue", credits: 3, notes: "" },
  { id: uid(), name: "Physics", code: "PHY 101", professor: "Prof. Lee", room: "Lab B-103", days: ["Tuesday", "Thursday"], startTime: "10:30", endTime: "12:00", color: "emerald", credits: 4, notes: "" },
  { id: uid(), name: "English Lit", code: "ENG 202", professor: "Ms. Davis", room: "Room C-305", days: ["Monday", "Wednesday"], startTime: "13:00", endTime: "14:30", color: "rose", credits: 3, notes: "" },
  { id: uid(), name: "Comp Sci", code: "CS 301", professor: "Dr. Wang", room: "Lab D-101", days: ["Tuesday", "Thursday"], startTime: "14:00", endTime: "15:30", color: "purple", credits: 3, notes: "" },
  { id: uid(), name: "Economics", code: "ECON 201", professor: "Prof. Brown", room: "Hall A-102", days: ["Friday"], startTime: "11:00", endTime: "12:30", color: "amber", credits: 3, notes: "" },
];

// ─── Color Dot ────────────────────────────────────────────────────────────────

const ColorDot = ({ colorId, size = 22, selected, onClick }) => {
  const c = CLASS_COLORS.find((x) => x.id === colorId) || CLASS_COLORS[0];
  return (
    <button type="button" onClick={onClick} title={colorId}
      style={{ width: size, height: size, borderRadius: "50%", background: c.bg, border: selected ? "3px solid white" : "2px solid transparent", boxShadow: selected ? `0 0 0 2px ${c.bg}` : "none", cursor: "pointer", outline: "none", flexShrink: 0, transition: "transform 0.15s", transform: selected ? "scale(1.2)" : "scale(1)" }}
    />
  );
};

// ─── Class Card ───────────────────────────────────────────────────────────────

const ClassCard = ({ cls, onEdit, onDelete }) => {
  const c = CLASS_COLORS.find((x) => x.id === cls.color) || CLASS_COLORS[0];
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-2 group hover:shadow-md transition-all duration-200" style={{ borderColor: c.border, background: c.light }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.bg }} />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: c.text }}>{cls.name}</p>
            {cls.code && <p className="text-xs" style={{ color: c.text, opacity: 0.7 }}>{cls.code}</p>}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/70 transition-colors" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {cls.days.map((d) => <span key={d} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg + "22", color: c.text }}>{d.slice(0, 3)}</span>)}
      </div>
      <div className="text-xs" style={{ color: c.text, opacity: 0.8 }}>
        {formatTime12(cls.startTime)} – {formatTime12(cls.endTime)}
        {cls.room && <span className="ml-2">📍 {cls.room}</span>}
      </div>
      {cls.professor && <div className="text-xs" style={{ color: c.text, opacity: 0.65 }}>👤 {cls.professor}</div>}
    </div>
  );
};

// ─── Class Form Modal ─────────────────────────────────────────────────────────

const EMPTY_CLASS = { id: "", name: "", code: "", professor: "", room: "", days: [], startTime: "09:00", endTime: "10:00", color: "blue", credits: 3, notes: "" };

function ClassFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_CLASS);
  const [errors, setErrors] = useState({});
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const toggleDay = (day) => setForm((f) => ({ ...f, days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day] }));
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Class name is required";
    if (!form.days.length) errs.days = "Select at least one day";
    if (timeToMinutes(form.endTime) <= timeToMinutes(form.startTime)) errs.time = "End time must be after start time";
    return errs;
  };
  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, id: form.id || uid() });
  };
  const inp = "w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400 transition-all";
  const lbl = "text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{form.id ? "Edit Class" : "Add New Class"}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fill in the class details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 text-sm">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Color */}
          <div>
            <label className={lbl}>Color</label>
            <div className="flex flex-wrap gap-2">
              {CLASS_COLORS.map((c) => <ColorDot key={c.id} colorId={c.id} size={26} selected={form.color === c.id} onClick={() => setForm((f) => ({ ...f, color: c.id }))} />)}
            </div>
          </div>
          {/* Name & Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Class Name *</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Calculus II" className={inp} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={lbl}>Course Code</label>
              <input value={form.code} onChange={set("code")} placeholder="e.g. MATH 201" className={inp} />
            </div>
          </div>
          {/* Professor & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Professor</label><input value={form.professor} onChange={set("professor")} placeholder="e.g. Dr. Smith" className={inp} /></div>
            <div><label className={lbl}>Room / Location</label><input value={form.room} onChange={set("room")} placeholder="e.g. Room A-201" className={inp} /></div>
          </div>
          {/* Days */}
          <div>
            <label className={lbl}>Days *</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"
                  style={form.days.includes(day) ? { background: "#6366f1", color: "white", borderColor: "#6366f1" } : { background: "transparent", color: "#6b7280", borderColor: "#e5e7eb" }}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            {errors.days && <p className="text-xs text-red-500 mt-1">{errors.days}</p>}
          </div>
          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Start Time</label><select value={form.startTime} onChange={set("startTime")} className={inp}>{TIMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className={lbl}>End Time</label><select value={form.endTime} onChange={set("endTime")} className={inp}>{TIMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          </div>
          {errors.time && <p className="text-xs text-red-500 -mt-3">{errors.time}</p>}
          {/* Credits & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Credits</label><input type="number" min={0} max={10} value={form.credits} onChange={set("credits")} className={inp} /></div>
            <div><label className={lbl}>Notes</label><input value={form.notes} onChange={set("notes")} placeholder="e.g. Bring lab coat" className={inp} /></div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            {form.id ? "Save Changes" : "Add Class"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Grid ─────────────────────────────────────────────────────────────

function ScheduleGrid({ classes, settings, previewRef }) {
  const theme = THEMES[settings.theme] || THEMES.modern;
  const days = settings.showWeekend ? DAYS : DAYS.slice(0, 5);
  const startMin = timeToMinutes(settings.startTime);
  const endMin = timeToMinutes(settings.endTime);
  const timeSlots = [];
  for (let m = startMin; m <= endMin; m += 60) timeSlots.push(m);
  const pxPerMin = settings.slotHeight / 60;
  const totalCredits = classes.reduce((s, c) => s + (Number(c.credits) || 0), 0);

  return (
    <div ref={previewRef} id="schedule-preview" style={{ background: theme.bg, fontFamily: `'${settings.font}', sans-serif`, borderRadius: 16, overflow: "hidden", minWidth: 700 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>{settings.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "4px 0 0" }}>{settings.subtitle}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "8px 16px", textAlign: "center" }}>
              <p style={{ color: "white", fontWeight: 700, fontSize: 18, margin: 0, lineHeight: 1 }}>{classes.length}</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: "3px 0 0" }}>Classes</p>
            </div>
            {settings.showCredits && (
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "8px 16px", textAlign: "center" }}>
                <p style={{ color: "white", fontWeight: 700, fontSize: 18, margin: 0, lineHeight: 1 }}>{totalCredits}</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: "3px 0 0" }}>Credits</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", minWidth: 600 }}>
          {/* Time column */}
          <div style={{ width: 72, flexShrink: 0 }}>
            <div style={{ height: 48, borderBottom: `1px solid ${theme.borderColor}`, background: theme.headerBg }} />
            {timeSlots.map((m, i) => (
              <div key={m} style={{ height: settings.slotHeight, borderBottom: `1px solid ${theme.borderColor}`, display: "flex", alignItems: "flex-start", paddingTop: 6, paddingRight: 10, justifyContent: "flex-end", color: theme.timeColor, fontSize: 10.5, fontWeight: 600, background: i % 2 === 0 ? theme.cellBg : theme.cellBg2, flexShrink: 0 }}>
                {formatTime12(minutesToTime(m))}
              </div>
            ))}
          </div>
          {/* Day columns */}
          {days.map((day) => (
            <div key={day} style={{ flex: 1, minWidth: 110, borderLeft: `1px solid ${theme.borderColor}` }}>
              <div style={{ height: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${theme.borderColor}`, background: theme.headerBg }}>
                <p style={{ color: theme.textSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{day.slice(0, 3)}</p>
                <p style={{ color: theme.timeColor, fontSize: 9, margin: "2px 0 0", opacity: 0.7 }}>{day}</p>
              </div>
              <div style={{ position: "relative", height: timeSlots.length * settings.slotHeight }}>
                {timeSlots.map((m, i) => (
                  <div key={m} style={{ position: "absolute", top: i * settings.slotHeight, left: 0, right: 0, height: settings.slotHeight, borderBottom: `1px solid ${theme.borderColor}`, background: i % 2 === 0 ? theme.cellBg : theme.cellBg2 }} />
                ))}
                {classes.map((cls) => {
                  if (!cls.days.includes(day)) return null;
                  const top = (timeToMinutes(cls.startTime) - startMin) * pxPerMin;
                  const height = (timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime)) * pxPerMin - 2;
                  const dur = timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);
                  const c = CLASS_COLORS.find((x) => x.id === cls.color) || CLASS_COLORS[0];
                  return (
                    <div key={cls.id} style={{ position: "absolute", top: top + 1, left: 3, right: 3, height, borderRadius: 8, background: theme.isDark ? `linear-gradient(145deg,${c.bg}cc,${c.bg}88)` : c.light, borderLeft: `3px solid ${c.bg}`, border: theme.isDark ? `1px solid ${c.bg}55` : `1px solid ${c.border}`, borderLeft: `3px solid ${c.bg}`, padding: "4px 6px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 1, boxShadow: theme.isDark ? `0 2px 12px ${c.bg}44` : `0 1px 4px ${c.bg}22` }}>
                      <p style={{ color: theme.isDark ? "#fff" : c.text, fontWeight: 700, fontSize: dur >= 90 ? 11 : 10, margin: 0, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.name}</p>
                      {cls.code && dur >= 60 && <p style={{ color: theme.isDark ? "rgba(255,255,255,0.65)" : c.text, fontSize: 9, margin: 0, opacity: 0.8 }}>{cls.code}</p>}
                      {settings.showRoom && cls.room && dur >= 60 && <p style={{ color: theme.isDark ? "rgba(255,255,255,0.55)" : c.text, fontSize: 9, margin: 0, opacity: 0.7 }}>📍 {cls.room}</p>}
                      {settings.showProfessor && cls.professor && dur >= 90 && <p style={{ color: theme.isDark ? "rgba(255,255,255,0.55)" : c.text, fontSize: 9, margin: 0, opacity: 0.7 }}>👤 {cls.professor}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${theme.borderColor}`, padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: theme.timeColor, fontSize: 10, margin: 0 }}>Generated with ToolsTrek · Class Schedule Maker</p>
        <p style={{ color: theme.timeColor, fontSize: 10, margin: 0 }}>{formatTime12(settings.startTime)} – {formatTime12(settings.endTime)}</p>
      </div>
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group select-none">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</span>
      <div className="relative ml-3 flex-shrink-0" onClick={onChange}>
        <div className={`w-10 h-5 rounded-full transition-all duration-200 ${checked ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
      </div>
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClassScheduleMaker() {
  const [classes, setClasses] = useState(SAMPLE_CLASSES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [modal, setModal] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);
  const previewRef = useRef(null);

  const setSetting = (key) => (val) =>
    setSettings((s) => ({ ...s, [key]: typeof val === "object" && val?.target ? (val.target.type === "checkbox" ? val.target.checked : val.target.value) : val }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSaveClass = (cls) => {
    setClasses((prev) => {
      const idx = prev.findIndex((c) => c.id === cls.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = cls; return u; }
      return [...prev, cls];
    });
    setModal(null);
    showToast(cls.id && classes.some(c => c.id === cls.id) ? "Class updated!" : "Class added!");
  };

  const handleDeleteClass = (id) => { setClasses((prev) => prev.filter((c) => c.id !== id)); showToast("Class removed", "info"); };

  const handleExportPDF = useCallback(async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const theme = THEMES[settings.theme] || THEMES.modern;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      const hex2rgb = (h) => { const x = h.replace("#", ""); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; };
      const [bgR, bgG, bgB] = hex2rgb(theme.bg);
      doc.setFillColor(bgR, bgG, bgB); doc.rect(0, 0, pageW, pageH, "F");
      doc.setFillColor(99, 102, 241); doc.roundedRect(0, 0, pageW, 60, 0, 0, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(18); doc.setFont("helvetica", "bold");
      doc.text(settings.title, 24, 30);
      doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(200, 200, 230);
      doc.text(settings.subtitle, 24, 48);
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
      doc.text(`${classes.length} Classes`, pageW - 24, 35, { align: "right" });
      if (settings.showCredits) {
        const tc = classes.reduce((s, c) => s + (Number(c.credits) || 0), 0);
        doc.text(`${tc} Credits`, pageW - 24, 52, { align: "right" });
      }

      const days = settings.showWeekend ? DAYS : DAYS.slice(0, 5);
      const startMin = timeToMinutes(settings.startTime);
      const endMin = timeToMinutes(settings.endTime);
      const timeSlots = []; for (let m = startMin; m <= endMin; m += 60) timeSlots.push(m);
      const gridTop = 70, headerH = 22, timeColW = 55, gridH = pageH - gridTop - 30;
      const slotH = Math.min(42, (gridH - headerH) / timeSlots.length);
      const dayColW = (pageW - timeColW) / days.length;
      const pxPerMin = slotH / 60;

      const [hR, hG, hB] = hex2rgb(theme.headerBg);
      doc.setFillColor(hR, hG, hB); doc.rect(0, gridTop, pageW, headerH, "F");
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      const [txR, txG, txB] = hex2rgb(theme.textSecondary);
      doc.setTextColor(txR, txG, txB);
      days.forEach((day, i) => { const x = timeColW + i * dayColW + dayColW / 2; doc.text(day.slice(0, 3).toUpperCase(), x, gridTop + 14, { align: "center" }); });

      const [brR, brG, brB] = hex2rgb(theme.borderColor);
      doc.setDrawColor(brR, brG, brB); doc.setLineWidth(0.3);
      const [cR2, cG2, cB2] = hex2rgb(theme.cellBg);

      timeSlots.forEach((m, i) => {
        const y = gridTop + headerH + i * slotH;
        if (i % 2 === 0) { doc.setFillColor(cR2, cG2, cB2); } else { doc.setFillColor(bgR, bgG, bgB); }
        doc.rect(timeColW, y, pageW - timeColW, slotH, "F");
        doc.line(0, y, pageW, y);
        const [tmR, tmG, tmB] = hex2rgb(theme.timeColor);
        doc.setTextColor(tmR, tmG, tmB); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
        doc.text(formatTime12(minutesToTime(m)), timeColW - 4, y + 8, { align: "right" });
      });
      days.forEach((_, i) => { const x = timeColW + i * dayColW; doc.line(x, gridTop, x, gridTop + headerH + timeSlots.length * slotH); });

      classes.forEach((cls) => {
        cls.days.forEach((day) => {
          const di = days.indexOf(day); if (di < 0) return;
          const cT = gridTop + headerH + (timeToMinutes(cls.startTime) - startMin) * pxPerMin;
          const cH = (timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime)) * pxPerMin - 2;
          const cX = timeColW + di * dayColW + 2, cW = dayColW - 4;
          const cc = CLASS_COLORS.find(x => x.id === cls.color) || CLASS_COLORS[0];
          const [cR, cG, cB] = hex2rgb(cc.bg);
          doc.setFillColor(cR, cG, cB, theme.isDark ? 0.7 : 0.15);
          doc.roundedRect(cX, cT, cW, cH, 3, 3, "F");
          doc.setFillColor(cR, cG, cB); doc.rect(cX, cT, 2.5, cH, "F");
          doc.setTextColor(theme.isDark ? 255 : cR, theme.isDark ? 255 : cG, theme.isDark ? 255 : cB);
          doc.setFontSize(8); doc.setFont("helvetica", "bold");
          doc.text(cls.name, cX + 5, cT + 9, { maxWidth: cW - 6 });
          if (cH > 18 && cls.code) { doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(theme.isDark ? 190 : cR, theme.isDark ? 190 : cG, theme.isDark ? 190 : cB); doc.text(cls.code, cX + 5, cT + 17, { maxWidth: cW - 6 }); }
          if (cH > 26 && settings.showRoom && cls.room) { doc.setFontSize(6); doc.text(`Rm: ${cls.room}`, cX + 5, cT + 24, { maxWidth: cW - 6 }); }
          if (cH > 34 && settings.showProfessor && cls.professor) { doc.text(cls.professor, cX + 5, cT + 31, { maxWidth: cW - 6 }); }
        });
      });

      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 120);
      doc.text("Generated with ToolsTrek Class Schedule Maker", 24, pageH - 8);
      doc.text(new Date().toLocaleDateString(), pageW - 24, pageH - 8, { align: "right" });
      doc.save(`${settings.title.replace(/\s+/g, "-").toLowerCase()}-schedule.pdf`);
      showToast("Schedule exported as PDF! 🎉");
    } catch (err) { console.error(err); showToast("PDF export failed. Try again.", "error"); }
    finally { setExporting(null); }
  }, [classes, settings]);

  const handleExportImage = useCallback(async () => {
    setExporting("image");
    try {
      const theme = THEMES[settings.theme] || THEMES.modern;
      const days = settings.showWeekend ? DAYS : DAYS.slice(0, 5);
      const startMin = timeToMinutes(settings.startTime);
      const endMin = timeToMinutes(settings.endTime);
      const timeSlots = [];
      for (let m = startMin; m <= endMin; m += 60) timeSlots.push(m);

      // Canvas dimensions
      const SCALE = 2;          // retina
      const TIME_W = 70;
      const HEADER_H = 50;
      const DAY_W = 140;
      const SLOT_H = settings.slotHeight;
      const TOP_H = 70;         // schedule title bar
      const FOOTER_H = 32;
      const W = (TIME_W + DAY_W * days.length);
      const H = TOP_H + HEADER_H + timeSlots.length * SLOT_H + FOOTER_H;

      const canvas = document.createElement("canvas");
      canvas.width = W * SCALE;
      canvas.height = H * SCALE;
      const ctx = canvas.getContext("2d");
      ctx.scale(SCALE, SCALE);

      const hex2rgb = (h) => {
        const x = h.replace("#", "");
        return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
      };
      const setFill = (hex, alpha = 1) => {
        const [r, g, b] = hex2rgb(hex);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      };
      const setStroke = (hex, alpha = 1) => {
        const [r, g, b] = hex2rgb(hex);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      };

      // ── Title bar ──
      const grad = ctx.createLinearGradient(0, 0, W, TOP_H);
      grad.addColorStop(0, "#6366f1");
      grad.addColorStop(0.5, "#8b5cf6");
      grad.addColorStop(1, "#ec4899");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, TOP_H);

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 16px Inter, sans-serif`;
      ctx.fillText(settings.title, 18, 26);
      ctx.font = `12px Inter, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(settings.subtitle, 18, 46);

      const totalCredits = classes.reduce((s, c) => s + (Number(c.credits) || 0), 0);
      ctx.font = `bold 13px Inter, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.fillText(`${classes.length} classes`, W - 16, 26);
      if (settings.showCredits) ctx.fillText(`${totalCredits} credits`, W - 16, 46);
      ctx.textAlign = "left";

      // ── Day header row ──
      setFill(theme.headerBg);
      ctx.fillRect(0, TOP_H, W, HEADER_H);
      // time col bg
      setFill(theme.headerBg);
      ctx.fillRect(0, TOP_H, TIME_W, HEADER_H);

      days.forEach((day, i) => {
        const x = TIME_W + i * DAY_W;
        ctx.fillStyle = theme.textSecondary;
        ctx.font = `bold 9px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(day.slice(0, 3).toUpperCase(), x + DAY_W / 2, TOP_H + 20);
        ctx.font = `9px Inter, sans-serif`;
        ctx.fillStyle = theme.timeColor;
        ctx.fillText(day, x + DAY_W / 2, TOP_H + 35);
        ctx.textAlign = "left";
      });

      // ── Time slot rows ──
      timeSlots.forEach((m, i) => {
        const y = TOP_H + HEADER_H + i * SLOT_H;
        setFill(i % 2 === 0 ? theme.cellBg : theme.cellBg2);
        ctx.fillRect(0, y, W, SLOT_H);

        // grid line
        setStroke(theme.borderColor);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();

        // time label
        ctx.fillStyle = theme.timeColor;
        ctx.font = `bold 9px Inter, sans-serif`;
        ctx.textAlign = "right";
        ctx.fillText(formatTime12(minutesToTime(m)), TIME_W - 6, y + 14);
        ctx.textAlign = "left";
      });

      // vertical day separators
      days.forEach((_, i) => {
        const x = TIME_W + i * DAY_W;
        setStroke(theme.borderColor);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, TOP_H); ctx.lineTo(x, TOP_H + HEADER_H + timeSlots.length * SLOT_H); ctx.stroke();
      });

      // time col separator
      setStroke(theme.borderColor);
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(TIME_W, TOP_H); ctx.lineTo(TIME_W, TOP_H + HEADER_H + timeSlots.length * SLOT_H); ctx.stroke();

      // header border bottom
      setStroke(theme.borderColor);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, TOP_H + HEADER_H); ctx.lineTo(W, TOP_H + HEADER_H); ctx.stroke();

      // ── Classes ──
      const pxPerMin = SLOT_H / 60;
      classes.forEach((cls) => {
        cls.days.forEach((day) => {
          const di = days.indexOf(day);
          if (di < 0) return;
          const cx = TIME_W + di * DAY_W + 3;
          const cy = TOP_H + HEADER_H + (timeToMinutes(cls.startTime) - startMin) * pxPerMin + 2;
          const cw = DAY_W - 6;
          const ch = (timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime)) * pxPerMin - 4;
          const dur = timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);
          const c = CLASS_COLORS.find(x => x.id === cls.color) || CLASS_COLORS[0];
          const [r, g, b] = hex2rgb(c.bg);

          // rounded rect fill
          ctx.beginPath();
          const radius = 6;
          ctx.moveTo(cx + radius, cy);
          ctx.lineTo(cx + cw - radius, cy);
          ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + radius);
          ctx.lineTo(cx + cw, cy + ch - radius);
          ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - radius, cy + ch);
          ctx.lineTo(cx + radius, cy + ch);
          ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - radius);
          ctx.lineTo(cx, cy + radius);
          ctx.quadraticCurveTo(cx, cy, cx + radius, cy);
          ctx.closePath();

          ctx.fillStyle = theme.isDark
            ? `rgba(${r},${g},${b},0.75)`
            : `rgba(${r},${g},${b},0.12)`;
          ctx.fill();

          // left accent bar
          ctx.fillStyle = c.bg;
          ctx.fillRect(cx, cy, 3, ch);

          // border
          ctx.strokeStyle = theme.isDark ? `rgba(${r},${g},${b},0.4)` : c.border;
          ctx.lineWidth = 1;
          ctx.stroke();

          // text
          const textColor = theme.isDark ? "#ffffff" : c.text;
          ctx.fillStyle = textColor;
          ctx.font = `bold ${dur >= 90 ? 10 : 9}px Inter, sans-serif`;
          ctx.fillText(cls.name, cx + 6, cy + 13, cw - 10);

          if (cls.code && dur >= 60) {
            ctx.font = `8px Inter, sans-serif`;
            ctx.fillStyle = theme.isDark ? "rgba(255,255,255,0.65)" : c.text;
            ctx.globalAlpha = 0.85;
            ctx.fillText(cls.code, cx + 6, cy + 24, cw - 10);
            ctx.globalAlpha = 1;
          }
          if (settings.showRoom && cls.room && dur >= 60) {
            ctx.font = `7.5px Inter, sans-serif`;
            ctx.fillStyle = theme.isDark ? "rgba(255,255,255,0.55)" : c.text;
            ctx.globalAlpha = 0.7;
            ctx.fillText(`⌂ ${cls.room}`, cx + 6, cy + 34, cw - 10);
            ctx.globalAlpha = 1;
          }
          if (settings.showProfessor && cls.professor && dur >= 90) {
            ctx.font = `7.5px Inter, sans-serif`;
            ctx.fillStyle = theme.isDark ? "rgba(255,255,255,0.55)" : c.text;
            ctx.globalAlpha = 0.65;
            ctx.fillText(`● ${cls.professor}`, cx + 6, cy + 44, cw - 10);
            ctx.globalAlpha = 1;
          }
        });
      });

      // ── Footer ──
      const footerY = TOP_H + HEADER_H + timeSlots.length * SLOT_H;
      setFill(theme.headerBg);
      ctx.fillRect(0, footerY, W, FOOTER_H);
      setStroke(theme.borderColor);
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, footerY); ctx.lineTo(W, footerY); ctx.stroke();

      ctx.font = `8px Inter, sans-serif`;
      ctx.fillStyle = theme.timeColor;
      ctx.fillText("Generated with ToolsTrek · Class Schedule Maker", 12, footerY + 20);
      ctx.textAlign = "right";
      ctx.fillText(new Date().toLocaleDateString(), W - 12, footerY + 20);
      ctx.textAlign = "left";

      // ── Download ──
      const link = document.createElement("a");
      link.download = `${settings.title.replace(/\s+/g, "-").toLowerCase()}-schedule.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Schedule saved as PNG image! 🖼️");
    } catch (err) {
      console.error("Image export error:", err);
      showToast("Image export failed. Please try PDF.", "error");
    } finally {
      setExporting(null);
    }
  }, [classes, settings]);

  const totalCredits = classes.reduce((s, c) => s + (Number(c.credits) || 0), 0);
  const inp = "w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400 transition-all";
  const lbl = "text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block";

  return (
    <ToolPageShell widthClassName="max-w-[1400px]">
      <div className="tool-page-content px-2 sm:px-4 pb-16">

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1" />
          <FavoriteButton toolLink="/tools/class-schedule-maker" />
        </div>

        {/* Hero */}
        <div className="text-center mb-10 relative">
          <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
            {["📅", "📚", "🎓", "✏️", "📖"].map((e, i) => (
              <span key={i} className="absolute text-2xl opacity-10"
                style={{ left: `${8 + i * 20}%`, top: `${Math.cos(i) * 25 + 20}%`, animation: `floatSch ${3 + i * 0.6}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}>
                {e}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-4">
            🎓 Smart Academic Planner
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            Class Schedule{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Maker</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Build, customize and export your perfect weekly class schedule — with live preview, 6 themes, and PDF / image export.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { icon: "📚", label: `${classes.length} Classes`, bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-indigo-200 dark:border-indigo-800/40", text: "text-indigo-600 dark:text-indigo-400" },
              { icon: "⭐", label: `${totalCredits} Credits`, bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800/40", text: "text-purple-600 dark:text-purple-400" },
              { icon: "📅", label: `${settings.showWeekend ? "7" : "5"} Days`, bg: "bg-pink-50 dark:bg-pink-900/20", border: "border-pink-200 dark:border-pink-800/40", text: "text-pink-600 dark:text-pink-400" },
            ].map(({ icon, label, bg, border, text }) => (
              <div key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bg} border ${border} ${text} text-sm font-semibold`}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 mb-6 w-fit mx-auto">
          {[{ key: "schedule", icon: "📅", label: "Preview" }, { key: "classes", icon: "📚", label: "Classes" }, { key: "settings", icon: "⚙️", label: "Settings" }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.key ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

          {/* ── Left Panel ── */}
          <div className="space-y-4">

            {/* Classes Tab */}
            {activeTab === "classes" && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Classes ({classes.length})</h3>
                    <button onClick={() => setModal({ mode: "add" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-semibold shadow-md shadow-indigo-500/30 transition-all hover:scale-[1.03] active:scale-95" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      + Add Class
                    </button>
                  </div>
                  {classes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-sm font-medium">No classes yet</p>
                      <p className="text-xs mt-1">Click "Add Class" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {classes.map((cls) => (
                        <ClassCard key={cls.id} cls={cls} onEdit={() => setModal({ mode: "edit", initial: cls })} onDelete={() => handleDeleteClass(cls.id)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500" />
                <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Schedule Settings</h3>
                  </div>

                  <div className="space-y-3">
                    <div><label className={lbl}>Schedule Title</label><input value={settings.title} onChange={e => setSetting("title")(e)} placeholder="My Class Schedule" className={inp} /></div>
                    <div><label className={lbl}>Subtitle / Semester</label><input value={settings.subtitle} onChange={e => setSetting("subtitle")(e)} placeholder="Spring 2025" className={inp} /></div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className={lbl}>Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(THEMES).map(([key, th]) => (
                        <button key={key} type="button" onClick={() => setSettings(s => ({ ...s, theme: key }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${settings.theme === key ? "border-indigo-500 ring-2 ring-indigo-400/40" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"}`}>
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: th.bg, border: `2px solid ${th.borderColor}` }} />
                          <span className="text-gray-700 dark:text-gray-300">{th.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={lbl}>Start Time</label><select value={settings.startTime} onChange={e => setSetting("startTime")(e)} className={inp}>{TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                    <div><label className={lbl}>End Time</label><select value={settings.endTime} onChange={e => setSetting("endTime")(e)} className={inp}>{TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                  </div>

                  {/* Slot height */}
                  <div>
                    <label className={lbl}>Row Height: <span className="text-indigo-500 font-bold">{settings.slotHeight}px</span></label>
                    <input type="range" min={40} max={100} step={5} value={settings.slotHeight} onChange={e => setSetting("slotHeight")(e)} className="w-full accent-indigo-500 mt-1" />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    {[
                      { key: "showWeekend", label: "Show Saturday & Sunday" },
                      { key: "showRoom", label: "Show Room / Location" },
                      { key: "showProfessor", label: "Show Professor Name" },
                      { key: "showCredits", label: "Show Credits Count" },
                    ].map(({ key, label }) => (
                      <Toggle key={key} checked={settings[key]} onChange={() => setSettings(s => ({ ...s, [key]: !s[key] }))} label={label} />
                    ))}
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <button onClick={() => setShowAdvanced(v => !v)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-all text-sm font-semibold">
                      <span className="text-base transition-transform duration-300 inline-block" style={{ transform: showAdvanced ? "rotate(45deg)" : "rotate(0deg)" }}>⚙️</span>
                      {showAdvanced ? "Hide Advanced Options" : "Advanced Options"}
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 border border-indigo-200 dark:border-indigo-800/40">Extra</span>
                    </button>

                    <div style={{ maxHeight: showAdvanced ? "600px" : "0px", overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                        <div>
                          <label className={lbl}>Font Family</label>
                          <select value={settings.font} onChange={e => setSetting("font")(e)} className={inp}>
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Semester Type</label>
                          <div className="flex flex-wrap gap-2">
                            {SEMESTER_TYPES.map(s => (
                              <button key={s} type="button" onClick={() => setSettings(st => ({ ...st, semesterType: s }))}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                                style={settings.semesterType === s ? { background: "#6366f1", color: "white", borderColor: "#6366f1" } : { background: "transparent", color: "#6b7280", borderColor: "#e5e7eb" }}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button" onClick={() => { setSettings(DEFAULT_SETTINGS); setClasses(SAMPLE_CLASSES); showToast("Reset to defaults!"); }}
                          className="w-full py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                          🔄 Reset to Defaults
                        </button>
                        <button type="button" onClick={() => { setClasses([]); showToast("All classes cleared", "info"); }}
                          className="w-full py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium">
                          🗑️ Clear All Classes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab – Actions Panel */}
            {activeTab === "schedule" && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500" />
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Export Schedule</h3>
                  </div>

                  <button onClick={handleExportPDF} disabled={!!exporting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {exporting === "pdf" ? (
                      <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block" />&nbsp;Generating PDF...</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> Export as PDF</>
                    )}
                  </button>

                  <button onClick={handleExportImage} disabled={!!exporting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    {exporting === "image" ? (
                      <><span className="animate-spin w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full inline-block" />&nbsp;Saving Image...</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg> Export as PNG Image</>
                    )}
                  </button>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => setModal({ mode: "add" })}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all">
                      ＋ Add New Class
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">Quick Summary</p>
                    {[
                      { label: "Total Classes", value: classes.length },
                      { label: "Total Credits", value: totalCredits },
                      { label: "Days Shown", value: settings.showWeekend ? "7 days" : "5 days" },
                      { label: "Theme", value: THEMES[settings.theme]?.name || "—" },
                      { label: "Time Range", value: `${formatTime12(settings.startTime)}–${formatTime12(settings.endTime)}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{label}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Panel – Preview ── */}
          <div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
              {/* Preview chrome bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">Live Preview</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/40 font-semibold">● Live</span>
              </div>
              <div className="p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900/50">
                <ScheduleGrid classes={classes} settings={settings} previewRef={previewRef} />
              </div>
            </div>

            {/* Legend */}
            {classes.length > 0 && (
              <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Legend</h3>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {classes.map((cls) => {
                    const c = CLASS_COLORS.find(x => x.id === cls.color) || CLASS_COLORS[0];
                    return (
                      <div key={cls.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c.bg }} />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{cls.name}</span>
                        {cls.credits > 0 && <span className="text-xs text-gray-400">({cls.credits}cr)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "🎨", title: "6 Beautiful Themes", desc: "Choose from Modern Dark, Clean Light, Ocean, Forest, Sunset, and Minimal — each crafted to make your schedule look stunning." },
            { icon: "📤", title: "PDF & Image Export", desc: "Download your schedule as a perfectly-formatted PDF or a high-res PNG — ideal for printing or sharing." },
            { icon: "⚙️", title: "Fully Customizable", desc: "Control titles, fonts, time ranges, slot heights, show/hide professors, rooms, credits, and weekend days." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="text-2xl mb-3">{icon}</div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold"
          style={{ background: toast.type === "error" ? "#ef4444" : toast.type === "info" ? "#6366f1" : "#10b981", animation: "toastIn 0.3s ease both" }}>
          {toast.type === "error" ? "❌" : toast.type === "info" ? "ℹ️" : "✅"} {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modal && <ClassFormModal initial={modal.initial || null} onSave={handleSaveClass} onClose={() => setModal(null)} />}

      <style jsx global>{`
        @keyframes floatSch {
          0%,100%{transform:translateY(0px) rotate(0deg);}
          50%{transform:translateY(-12px) rotate(6deg);}
        }
        @keyframes toastIn {
          from{opacity:0;transform:translateY(20px) scale(0.95);}
          to{opacity:1;transform:translateY(0) scale(1);}
        }
      `}</style>
    </ToolPageShell>
  );
}
