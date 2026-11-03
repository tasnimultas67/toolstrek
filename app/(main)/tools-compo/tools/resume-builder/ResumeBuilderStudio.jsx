"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Briefcase,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FolderGit2,
  GraduationCap,
  HeartHandshake,
  Languages,
  Plus,
  Printer,
  RefreshCw,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  UserRound,
  Users,
  Wand2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  DEFAULT_RESUME_SETTINGS,
  PAGE_SIZES,
  RESUME_ACCENTS,
  RESUME_FAQS,
  RESUME_FONTS,
  RESUME_STORAGE_KEY,
  RESUME_TEMPLATES,
  SECTION_DEFS,
  completenessScore,
  createDemoResume,
  createEmptyResume,
  keywordMatch,
  makeResumeId,
  resumeHasContent,
  resumePlainText,
} from "./resumeData";

const TOOL_META = { title: "Resume / CV Builder", link: "/tools/resume-builder", icon: "IdCard" };

const SECTION_ICONS = {
  summary: Sparkles,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderGit2,
  certifications: BadgeCheck,
  languages: Languages,
  awards: Trophy,
  volunteer: HeartHandshake,
  interests: Sparkles,
  references: Users,
  custom: FileJson,
};

const REPEATABLE_CONFIG = {
  experience: {
    addLabel: "Add experience",
    fields: [
      { key: "role", label: "Job title", col: 2, placeholder: "Senior Product Designer" },
      { key: "company", label: "Company", placeholder: "Northstar Analytics" },
      { key: "location", label: "Location", placeholder: "San Francisco, CA" },
      { key: "start", label: "Start", placeholder: "Jan 2021" },
      { key: "end", label: "End", placeholder: "Present" },
      { key: "bullets", label: "Achievements (one per line)", type: "textarea", col: 2, rows: 4 },
    ],
    summary: (item) => item.role || item.company || "Untitled role",
  },
  education: {
    addLabel: "Add education",
    fields: [
      { key: "degree", label: "Degree", col: 2, placeholder: "BSc Computer Science" },
      { key: "school", label: "School", placeholder: "University of Example" },
      { key: "location", label: "Location", placeholder: "Boston, MA" },
      { key: "start", label: "Start", placeholder: "2016" },
      { key: "end", label: "End", placeholder: "2020" },
      { key: "details", label: "Details", type: "textarea", col: 2, rows: 2 },
    ],
    summary: (item) => item.degree || item.school || "Untitled education",
  },
  skills: {
    addLabel: "Add skill group",
    fields: [
      { key: "category", label: "Category", placeholder: "Design" },
      { key: "items", label: "Skills (comma separated)", col: 2, placeholder: "Figma, Prototyping, Design systems" },
    ],
    summary: (item) => item.category || item.items || "Untitled skill group",
  },
  projects: {
    addLabel: "Add project",
    fields: [
      { key: "name", label: "Project name", placeholder: "Atlas Design System" },
      { key: "link", label: "Link", placeholder: "github.com/you/project" },
      { key: "description", label: "Description", type: "textarea", col: 2, rows: 3 },
    ],
    summary: (item) => item.name || "Untitled project",
  },
  certifications: {
    addLabel: "Add certification",
    fields: [
      { key: "name", label: "Certification", col: 2, placeholder: "Certified Professional" },
      { key: "issuer", label: "Issuer", placeholder: "IAAP" },
      { key: "date", label: "Date", placeholder: "2023" },
    ],
    summary: (item) => item.name || "Untitled certification",
  },
  languages: {
    addLabel: "Add language",
    fields: [
      { key: "name", label: "Language", placeholder: "Spanish" },
      { key: "level", label: "Proficiency", placeholder: "Professional working proficiency" },
    ],
    summary: (item) => item.name || "Untitled language",
  },
  awards: {
    addLabel: "Add award",
    fields: [
      { key: "title", label: "Award", col: 2, placeholder: "Best Enterprise Product" },
      { key: "issuer", label: "Issuer", placeholder: "Design Awards" },
      { key: "date", label: "Date", placeholder: "2023" },
    ],
    summary: (item) => item.title || "Untitled award",
  },
  volunteer: {
    addLabel: "Add volunteer role",
    fields: [
      { key: "role", label: "Role", col: 2, placeholder: "Mentor" },
      { key: "organization", label: "Organisation", placeholder: "Design Access Collective" },
      { key: "start", label: "Start", placeholder: "2022" },
      { key: "end", label: "End", placeholder: "Present" },
      { key: "description", label: "Description", type: "textarea", col: 2, rows: 3 },
    ],
    summary: (item) => item.role || item.organization || "Untitled role",
  },
  references: {
    addLabel: "Add reference",
    fields: [
      { key: "name", label: "Name", placeholder: "Jordan Lee" },
      { key: "role", label: "Role", placeholder: "VP Product" },
      { key: "company", label: "Company", placeholder: "Northstar Analytics" },
      { key: "contact", label: "Contact", col: 2, placeholder: "jordan.lee@example.com" },
    ],
    summary: (item) => item.name || "Untitled reference",
  },
  custom: {
    addLabel: "Add custom item",
    fields: [
      { key: "title", label: "Title", col: 2, placeholder: "Speaking" },
      { key: "content", label: "Content", type: "textarea", col: 2, rows: 3 },
    ],
    summary: (item) => item.title || "Untitled custom item",
  },
};

const SECTION_BY_KEY = Object.fromEntries(SECTION_DEFS.map((section) => [section.key, section]));

function sectionHasContent(key, data) {
  if (key === "summary") return Boolean(data.summary?.trim());
  if (key === "interests") return Boolean(data.interests?.trim());
  const value = data[key];
  if (!Array.isArray(value)) return false;
  return value.some((item) =>
    Object.entries(item || {}).some(
      ([field, entry]) => field !== "id" && typeof entry === "string" && entry.trim(),
    ),
  );
}

function dateRange(start, end) {
  const parts = [start, end].map((part) => (part || "").trim()).filter(Boolean);
  return parts.join(" – ");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function printHtml(element, settings, name) {
  const page = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.a4;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(name || "Resume")}</title><style>
@page { size: ${page.css}; margin: 0; }
html, body { margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.resume-page { width: 100% !important; min-height: 0 !important; box-shadow: none !important; }
</style></head><body>${element.outerHTML}</body></html>`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

/* -------------------------------------------------------------------------- */
/*  Resume document (inline styles so the print window can copy it verbatim)  */
/* -------------------------------------------------------------------------- */

function ResumeDocument({ data, settings }) {
  const page = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.a4;
  const palette = settings.accent || "#0f766e";
  const font = RESUME_FONTS.find((item) => item.value === settings.font) || RESUME_FONTS[0];
  const base = 13.2 * settings.fontScale;
  const spacing = settings.spacing;
  const personal = data.personal || {};
  const template = settings.template;
  const hidden = new Set(settings.hiddenSections || []);
  const visibleSections = (settings.sectionOrder || [])
    .filter((key) => !hidden.has(key) && sectionHasContent(key, data));

  const nameStyle = {
    margin: 0,
    fontSize: `${(template === "classic" ? 32 : template === "minimal" ? 30 : 34) * settings.fontScale}px`,
    lineHeight: 1.08,
    letterSpacing: "-0.02em",
    fontWeight: 800,
    color: template === "executive" ? "#ffffff" : template === "modern" ? palette : "#111827",
  };
  const titleStyle = {
    margin: "5px 0 0",
    fontSize: `${base * 1.06}px`,
    fontWeight: 600,
    color: template === "executive" ? "rgba(255,255,255,0.9)" : template === "modern" ? "#334155" : "#475569",
  };
  const contactStyle = {
    margin: "8px 0 0",
    fontSize: `${base * 0.88}px`,
    lineHeight: 1.5,
    color: template === "executive" ? "rgba(255,255,255,0.82)" : "#475569",
    display: "flex",
    flexWrap: "wrap",
    gap: "3px 10px",
    justifyContent: template === "classic" ? "center" : "flex-start",
  };

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter((item) => item && item.trim());

  const photo =
    settings.showPhoto && personal.photo ? (
      <div
        aria-label="Profile photo"
        style={{
          width: 82,
          height: 82,
          flexShrink: 0,
          borderRadius: settings.photoShape === "rounded" ? 12 : "50%",
          backgroundImage: `url(${personal.photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: `2px solid ${template === "executive" ? "rgba(255,255,255,0.7)" : palette}`,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      />
    ) : null;

  const header = (() => {
    if (template === "executive") {
      return (
        <header
          style={{
            margin: `-${settings.margins}px -${settings.margins}px 22px`,
            padding: `32px ${settings.margins}px 26px`,
            background: palette,
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ minWidth: 0 }}>
              {personal.fullName && <h1 style={nameStyle}>{personal.fullName}</h1>}
              {personal.title && <p style={titleStyle}>{personal.title}</p>}
              {contactItems.length > 0 && (
                <p style={contactStyle}>
                  {contactItems.map((item, index) => (
                    <span key={`${item}-${index}`}>
                      {item}
                      {index < contactItems.length - 1 ? " ·" : ""}
                    </span>
                  ))}
                </p>
              )}
            </div>
            {photo}
          </div>
        </header>
      );
    }

    if (template === "classic") {
      return (
        <header
          style={{
            textAlign: "center",
            borderBottom: "2px solid #111827",
            paddingBottom: 14,
            marginBottom: 18 * spacing,
          }}
        >
          {photo && <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>{photo}</div>}
          {personal.fullName && <h1 style={nameStyle}>{personal.fullName}</h1>}
          {personal.title && <p style={titleStyle}>{personal.title}</p>}
          {contactItems.length > 0 && <p style={contactStyle}>{contactItems.join("  ·  ")}</p>}
        </header>
      );
    }

    if (template === "minimal") {
      return (
        <header style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 14, marginBottom: 18 * spacing }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div style={{ minWidth: 0 }}>
              {personal.fullName && <h1 style={nameStyle}>{personal.fullName}</h1>}
              {personal.title && <p style={titleStyle}>{personal.title}</p>}
              {contactItems.length > 0 && <p style={contactStyle}>{contactItems.join("  ·  ")}</p>}
            </div>
            {photo}
          </div>
        </header>
      );
    }

    return (
      <header
        style={{
          borderBottom: `3px solid ${palette}`,
          paddingBottom: 14,
          marginBottom: 18 * spacing,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div style={{ minWidth: 0 }}>
            {personal.fullName && <h1 style={nameStyle}>{personal.fullName}</h1>}
            {personal.title && <p style={titleStyle}>{personal.title}</p>}
            {contactItems.length > 0 && <p style={contactStyle}>{contactItems.join("  ·  ")}</p>}
          </div>
          {photo}
        </div>
      </header>
    );
  })();

  const sectionTitleStyle = {
    margin: 0,
    fontSize: `${11.4 * settings.fontScale}px`,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.11em",
    color: template === "modern" || template === "executive" ? palette : "#111827",
    ...(template === "classic"
      ? { borderBottom: "1px solid #111827", paddingBottom: 4 }
      : template === "minimal"
        ? { borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }
        : template === "executive"
          ? { borderLeft: `3px solid ${palette}`, paddingLeft: 8 }
          : { borderBottom: `2px solid ${palette}`, paddingBottom: 4 }),
  };

  const sectionWrap = {
    marginBottom: `${17 * spacing}px`,
  };

  const muted = { color: "#475569" };
  const small = { fontSize: `${base * 0.88}px`, ...muted };
  const row = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" };
  const bulletList = { margin: "4px 0 0", paddingLeft: 16 };
  const bulletItem = { marginBottom: 2.5 };

  const renderSection = (key) => {
    if (key === "summary") {
      return (
        <p key={key} style={{ margin: 0, ...muted }}>
          {data.summary}
        </p>
      );
    }
    if (key === "interests") {
      return (
        <p key={key} style={{ margin: 0, ...muted }}>
          {data.interests}
        </p>
      );
    }
    if (key === "experience") {
      return data.experience.map((item) => {
        const bullets = (item.bullets || "")
          .split("\n")
          .map((line) => line.trim().replace(/^[-•]\s*/, ""))
          .filter(Boolean);
        return (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <div style={row}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 700 }}>{item.role}</span>
                {item.company && <span style={{ ...muted }}> · {item.company}</span>}
                {item.location && <span style={{ ...muted }}> — {item.location}</span>}
              </div>
              {dateRange(item.start, item.end) && <span style={{ ...small, whiteSpace: "nowrap" }}>{dateRange(item.start, item.end)}</span>}
            </div>
            {bullets.length > 0 && (
              <ul style={bulletList}>
                {bullets.map((line, index) => (
                  <li key={index} style={bulletItem}>
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      });
    }
    if (key === "education") {
      return data.education.map((item) => (
        <div key={item.id} style={{ marginBottom: 9 }}>
          <div style={row}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 700 }}>{item.degree}</span>
              {item.school && <span style={{ ...muted }}> · {item.school}</span>}
              {item.location && <span style={{ ...muted }}> — {item.location}</span>}
            </div>
            {dateRange(item.start, item.end) && <span style={{ ...small, whiteSpace: "nowrap" }}>{dateRange(item.start, item.end)}</span>}
          </div>
          {item.details && <p style={{ margin: "3px 0 0", ...muted }}>{item.details}</p>}
        </div>
      ));
    }
    if (key === "skills") {
      return (
        <div key={key} style={{ display: "grid", gap: 4 }}>
          {data.skills.map((item) => (
            <p key={item.id} style={{ margin: 0, ...muted }}>
              {item.category && <span style={{ fontWeight: 700, color: "#111827" }}>{item.category}: </span>}
              {item.items}
            </p>
          ))}
        </div>
      );
    }
    if (key === "projects") {
      return data.projects.map((item) => (
        <div key={item.id} style={{ marginBottom: 9 }}>
          <div style={row}>
            <span style={{ fontWeight: 700 }}>{item.name}</span>
            {item.link && <span style={{ ...small, color: palette, wordBreak: "break-word" }}>{item.link}</span>}
          </div>
          {item.description && <p style={{ margin: "2px 0 0", ...muted }}>{item.description}</p>}
        </div>
      ));
    }
    if (key === "certifications") {
      return data.certifications.map((item) => (
        <div key={item.id} style={row}>
          <span>
            <span style={{ fontWeight: 700 }}>{item.name}</span>
            {item.issuer && <span style={{ ...muted }}> · {item.issuer}</span>}
          </span>
          {item.date && <span style={{ ...small, whiteSpace: "nowrap" }}>{item.date}</span>}
        </div>
      ));
    }
    if (key === "languages") {
      return (
        <div key={key} style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px" }}>
          {data.languages.map((item) => (
            <span key={item.id}>
              <span style={{ fontWeight: 700 }}>{item.name}</span>
              {item.level && <span style={{ ...muted }}> — {item.level}</span>}
            </span>
          ))}
        </div>
      );
    }
    if (key === "awards") {
      return data.awards.map((item) => (
        <div key={item.id} style={row}>
          <span>
            <span style={{ fontWeight: 700 }}>{item.title}</span>
            {item.issuer && <span style={{ ...muted }}> · {item.issuer}</span>}
          </span>
          {item.date && <span style={{ ...small, whiteSpace: "nowrap" }}>{item.date}</span>}
        </div>
      ));
    }
    if (key === "volunteer") {
      return data.volunteer.map((item) => (
        <div key={item.id} style={{ marginBottom: 9 }}>
          <div style={row}>
            <span>
              <span style={{ fontWeight: 700 }}>{item.role}</span>
              {item.organization && <span style={{ ...muted }}> · {item.organization}</span>}
            </span>
            {dateRange(item.start, item.end) && <span style={{ ...small, whiteSpace: "nowrap" }}>{dateRange(item.start, item.end)}</span>}
          </div>
          {item.description && <p style={{ margin: "2px 0 0", ...muted }}>{item.description}</p>}
        </div>
      ));
    }
    if (key === "references") {
      return data.references.map((item) => (
        <div key={item.id} style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 700 }}>{item.name}</span>
          {(item.role || item.company) && (
            <span style={{ ...muted }}>
              {" "}
              — {[item.role, item.company].filter(Boolean).join(", ")}
            </span>
          )}
          {item.contact && <div style={{ ...small }}>{item.contact}</div>}
        </div>
      ));
    }
    if (key === "custom") {
      return data.custom.map((item) => (
        <div key={item.id} style={{ marginBottom: 9 }}>
          {item.title && <p style={{ margin: 0, fontWeight: 700 }}>{item.title}</p>}
          {item.content && (
            <p style={{ margin: "2px 0 0", ...muted, whiteSpace: "pre-line" }}>{item.content}</p>
          )}
        </div>
      ));
    }
    return null;
  };

  return (
    <div
      className="resume-page"
      style={{
        width: `${page.width}px`,
        minHeight: `${page.height}px`,
        boxSizing: "border-box",
        padding: `${settings.margins}px`,
        background: "#ffffff",
        color: "#111827",
        fontFamily: font.stack,
        fontSize: `${base}px`,
        lineHeight: 1.42,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {header}
      {visibleSections.map((key) => (
        <section key={key} style={sectionWrap}>
          <h2 style={sectionTitleStyle}>
            {key === "custom" ? "Additional information" : SECTION_BY_KEY[key]?.label || key}
          </h2>
          <div style={{ marginTop: 8 }}>{renderSection(key)}</div>
        </section>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form primitives                                                           */
/* -------------------------------------------------------------------------- */

function TextField({ label, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <div className={className}>
      <span className={labelClass}>{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClass(false, "emerald")}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3, className = "", hint }) {
  return (
    <div className={className}>
      <span className={labelClass}>{label}</span>
      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${fieldClass(false, "emerald")} resize-y`}
      />
      {hint && <p className="mt-1 text-[13px] leading-snug text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function RepeatableEditor({ sectionKey, items, onChange, tone = "emerald" }) {
  const config = REPEATABLE_CONFIG[sectionKey];
  if (!config) return null;

  const updateItem = (id, patch) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    const empty = { id: makeResumeId() };
    config.fields.forEach((field) => {
      empty[field.key] = "";
    });
    onChange([...items, empty]);
  };

  const removeItem = (id) => onChange(items.filter((item) => item.id !== id));

  const moveItem = (id, direction) => {
    const index = items.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center dark:border-slate-700 dark:bg-slate-800/30">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Nothing added yet</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
            Add your first entry. Every field is blank until you type, and you can remove or reorder entries at any time.
          </p>
        </div>
      ) : (
        items.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-[13px] font-black text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-white">
                {config.summary(item)}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(item.id, -1)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                  aria-label="Move entry up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(item.id, 1)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                  aria-label="Move entry down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  aria-label="Remove entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {config.fields.map((field) => {
                const common = {
                  key: field.key,
                  label: field.label,
                  value: item[field.key],
                  onChange: (value) => updateItem(item.id, { [field.key]: value }),
                  placeholder: field.placeholder,
                  className: field.col === 2 ? "sm:col-span-2" : "",
                };
                if (field.type === "textarea") {
                  return <TextAreaField key={field.key} {...common} rows={field.rows || 3} />;
                }
                return <TextField key={field.key} {...common} />;
              })}
            </div>
          </div>
        ))
      )}

      <ActionButton variant="primary" tone={tone} icon={Plus} onClick={addItem}>
        {config.addLabel}
      </ActionButton>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main tool                                                                 */
/* -------------------------------------------------------------------------- */

export default function ResumeBuilderStudio() {
  const { addRecentTool } = useRecentTools();
  const [data, setData] = useState(() => createEmptyResume());
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_RESUME_SETTINGS,
    sectionOrder: [...DEFAULT_RESUME_SETTINGS.sectionOrder],
    hiddenSections: [],
  }));
  const [hydrated, setHydrated] = useState(false);
  const [jobText, setJobText] = useState("");
  const [scale, setScale] = useState(1);
  const [docHeight, setDocHeight] = useState(PAGE_SIZES.a4.height);
  const [showJobMatch, setShowJobMatch] = useState(false);

  const pageRef = useRef(null);
  const previewWrapRef = useRef(null);
  const photoInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const page = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.a4;
  const hasContent = useMemo(() => resumeHasContent(data), [data]);
  const score = useMemo(() => completenessScore(data), [data]);
  const match = useMemo(
    () => (jobText.trim() ? keywordMatch(resumePlainText(data), jobText) : { matched: [], missing: [] }),
    [data, jobText],
  );

  const updateSetting = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(RESUME_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.data) {
            const empty = createEmptyResume();
            setData({
              ...empty,
              ...saved.data,
              personal: { ...empty.personal, ...(saved.data.personal || {}) },
            });
          }
          if (saved?.settings) {
            setSettings((current) => {
              const merged = { ...current, ...saved.settings };
              merged.sectionOrder = SECTION_DEFS.map((section) => section.key).filter((key) =>
                (saved.settings.sectionOrder || current.sectionOrder).includes(key),
              );
              SECTION_DEFS.forEach((section) => {
                if (!merged.sectionOrder.includes(section.key)) merged.sectionOrder.push(section.key);
              });
              merged.hiddenSections = (saved.settings.hiddenSections || []).filter((key) =>
                SECTION_DEFS.some((section) => section.key === key),
              );
              return merged;
            });
          }
        }
      } catch {
        // Ignore corrupt storage and keep the blank defaults.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify({ data, settings }));
      } catch {
        // Photos can exceed the quota; editing still works.
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [data, settings, hydrated]);

  useEffect(() => {
    const wrap = previewWrapRef.current;
    const element = pageRef.current;
    if (!wrap || !element) return undefined;
    const update = () => {
      setScale(Math.min(1, wrap.clientWidth / page.width));
      setDocHeight(Math.max(page.height, element.scrollHeight));
    };
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    observer.observe(element);
    update();
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [page.width, page.height, data, settings, hasContent]);

  const patchPersonal = (patch) => {
    setData((current) => ({ ...current, personal: { ...current.personal, ...patch } }));
  };

  const toggleSection = (key) => {
    setSettings((current) => {
      const hidden = new Set(current.hiddenSections || []);
      if (hidden.has(key)) hidden.delete(key);
      else hidden.add(key);
      return { ...current, hiddenSections: [...hidden] };
    });
  };

  const moveSection = (key, direction) => {
    setSettings((current) => {
      const order = [...current.sectionOrder];
      const index = order.indexOf(key);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return current;
      const [moved] = order.splice(index, 1);
      order.splice(nextIndex, 0, moved);
      return { ...current, sectionOrder: order };
    });
  };

  const loadDemo = () => {
    setData(createDemoResume());
    setSettings((current) => ({ ...current, hiddenSections: [] }));
    setShowJobMatch(false);
    toast.success("Demo resume loaded — replace every field with your own details");
  };

  const clearAll = () => {
    if (typeof window !== "undefined" && !window.confirm("Clear every field and section? This cannot be undone.")) return;
    setData(createEmptyResume());
    setJobText("");
    toast.success("Resume cleared");
  };

  const handlePhoto = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPEG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photos up to 5 MB are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patchPersonal({ photo: String(reader.result || "") });
      toast.success("Profile photo added");
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const openPrintWindow = () => {
    if (!pageRef.current || !hasContent) {
      toast.error("Add some resume content first.");
      return;
    }
    const html = printHtml(pageRef.current.parentElement?.parentElement?.querySelector(".resume-page") || pageRef.current, settings, data.personal.fullName);
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("The print window was blocked. Allow pop-ups for this site.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    window.setTimeout(() => {
      try {
        win.print();
      } catch {
        // The user can still print from the new tab.
      }
    }, 450);
  };

  const exportHtml = () => {
    if (!pageRef.current || !hasContent) return;
    const html = printHtml(pageRef.current, settings, data.personal.fullName);
    downloadBlob(new Blob([html], { type: "text/html" }), `${(data.personal.fullName || "resume").replace(/[^\w-]+/g, "-")}.html`);
    toast.success("HTML resume downloaded");
  };

  const exportJson = () => {
    const payload = { app: "toolstrek-resume", version: 1, exportedAt: new Date().toISOString(), data, settings };
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
      `${(data.personal.fullName || "resume").replace(/[^\w-]+/g, "-")}.json`,
    );
    toast.success("Resume project exported");
  };

  const importJson = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const incoming = parsed.data || parsed;
        if (!incoming || !incoming.personal) throw new Error("This file is not a resume project.");
        const empty = createEmptyResume();
        setData({
          ...empty,
          ...incoming,
          personal: { ...empty.personal, ...(incoming.personal || {}) },
        });
        if (parsed.settings) {
          setSettings((current) => ({ ...current, ...parsed.settings }));
        }
        toast.success("Resume project imported");
      } catch (error) {
        toast.error(error.message || "Could not read that project file.");
      }
    };
    reader.readAsText(file);
  };

  const pageCount = Math.max(1, Math.ceil(docHeight / page.height));

  const tips = [];
  if (!data.personal.fullName.trim()) tips.push("Add your full name at the top.");
  if (!data.personal.email.trim()) tips.push("Add a professional email address.");
  if (!data.summary.trim()) tips.push("Write a two-line professional summary.");
  if (!data.experience.length) tips.push("Add at least one role with measurable achievements.");
  if (!data.skills.length) tips.push("Group your strongest skills into categories.");
  if (data.experience.some((item) => (item.bullets || "").length < 40)) tips.push("Turn duties into results with numbers.");
  if (tips.length === 0) tips.push("Strong start — tailor the summary to the job advert next.");

  const renderSectionEditor = (key) => {
    const meta = SECTION_BY_KEY[key];
    if (!meta) return null;
    const Icon = SECTION_ICONS[key] || FileJson;
    const hidden = settings.hiddenSections.includes(key);
    const actions = (
      <>
        <Chip tone={hidden ? "amber" : "emerald"}>{hidden ? "Hidden" : "Visible"}</Chip>
        <ActionButton
          variant="ghost"
          icon={hidden ? EyeOff : Eye}
          onClick={() => toggleSection(key)}
        >
          {hidden ? "Show" : "Hide"}
        </ActionButton>
      </>
    );

    if (key === "summary" || key === "interests") {
      return (
        <SectionCard key={key} icon={Icon} title={meta.label} description={meta.hint} tone="emerald" actions={actions}>
          <TextAreaField
            label={meta.label}
            value={data[key]}
            onChange={(value) => setData((current) => ({ ...current, [key]: value }))}
            placeholder={key === "summary" ? "Two or three lines about your experience, strengths and what you want next…" : "What do you enjoy outside work?"}
            rows={key === "summary" ? 4 : 2}
          />
        </SectionCard>
      );
    }

    return (
      <SectionCard key={key} icon={Icon} title={meta.label} description={meta.hint} tone="emerald" actions={actions}>
        <RepeatableEditor
          sectionKey={key}
          items={data[key] || []}
          onChange={(items) => setData((current) => ({ ...current, [key]: items }))}
        />
      </SectionCard>
    );
  };

  return (
    <div className="tool-page-content space-y-5">
      <Hero
        eyebrow="Career studio"
        icon={UserRound}
        title="Resume / CV Builder"
        description="Build a clean, ATS-friendly resume with live A4 or US Letter preview. Every field starts blank, every section can be reordered, and the finished document prints to a vector PDF directly from your browser."
        badges={["Blank by default", "4 templates", "ATS-friendly text", "Print to PDF"]}
        tone="emerald"
      />

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton variant="primary" tone="emerald" icon={Printer} onClick={openPrintWindow} disabled={!hasContent}>
          Print / Save PDF
        </ActionButton>
        <ActionButton icon={FileJson} onClick={exportJson} disabled={!hasContent}>
          Export JSON
        </ActionButton>
        <ActionButton icon={Upload} onClick={() => jsonInputRef.current?.click()}>
          Import JSON
        </ActionButton>
        <input
          ref={jsonInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            importJson(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <ActionButton icon={Wand2} onClick={loadDemo}>
          Load demo data
        </ActionButton>
        <ActionButton variant="ghost" icon={RefreshCw} onClick={clearAll} className="ml-auto">
          Clear all
        </ActionButton>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={UserRound}
            title="Personal details"
            description="These appear in the header. Leave anything you do not want to share blank."
            tone="emerald"
            actions={<Chip tone="emerald">{hasContent ? "Drafting" : "Blank draft"}</Chip>}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Full name"
                value={data.personal.fullName}
                onChange={(value) => patchPersonal({ fullName: value })}
                placeholder="Your name"
                className="sm:col-span-2"
              />
              <TextField
                label="Professional title"
                value={data.personal.title}
                onChange={(value) => patchPersonal({ title: value })}
                placeholder="Product Designer"
                className="sm:col-span-2"
              />
              <TextField label="Email" value={data.personal.email} onChange={(value) => patchPersonal({ email: value })} placeholder="you@example.com" />
              <TextField label="Phone" value={data.personal.phone} onChange={(value) => patchPersonal({ phone: value })} placeholder="+1 555 000 0000" />
              <TextField label="Location" value={data.personal.location} onChange={(value) => patchPersonal({ location: value })} placeholder="City, Country" />
              <TextField label="Website" value={data.personal.website} onChange={(value) => patchPersonal({ website: value })} placeholder="yourname.com" />
              <TextField label="LinkedIn" value={data.personal.linkedin} onChange={(value) => patchPersonal({ linkedin: value })} placeholder="linkedin.com/in/you" />
              <TextField label="GitHub / portfolio" value={data.personal.github} onChange={(value) => patchPersonal({ github: value })} placeholder="github.com/you" />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="h-16 w-16 shrink-0 rounded-full border border-slate-200 bg-slate-100 bg-cover bg-center dark:border-slate-600 dark:bg-slate-700"
                  style={data.personal.photo ? { backgroundImage: `url(${data.personal.photo})` } : undefined}
                  role="img"
                  aria-label={data.personal.photo ? "Profile photo preview" : "No profile photo"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Profile photo</p>
                  <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Optional. Photos are embedded in this browser and never uploaded.
                  </p>
                </div>
                <div className="flex gap-2">
                  <ActionButton icon={Upload} onClick={() => photoInputRef.current?.click()}>
                    {data.personal.photo ? "Replace" : "Upload"}
                  </ActionButton>
                  {data.personal.photo && (
                    <ActionButton variant="danger" icon={Trash2} onClick={() => patchPersonal({ photo: "" })}>
                      Remove
                    </ActionButton>
                  )}
                </div>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  handlePhoto(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>
          </SectionCard>

          {settings.sectionOrder.map((key) => renderSectionEditor(key))}

          <SectionCard
            icon={FileJson}
            title="Section order & visibility"
            description="Move sections up or down. Hidden sections stay in your draft but are removed from the resume."
            tone="violet"
          >
            <div className="space-y-2">
              {settings.sectionOrder.map((key, index) => {
                const meta = SECTION_BY_KEY[key];
                const hidden = settings.hiddenSections.includes(key);
                return (
                  <div
                    key={key}
                    className={`flex flex-wrap items-center gap-2 rounded-xl border p-2.5 ${
                      hidden
                        ? "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/40"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{meta?.label || key}</span>
                      <span className="block text-[13px] text-slate-500 dark:text-slate-400">
                        {sectionHasContent(key, data) ? "Has content" : "Empty — hidden automatically"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => moveSection(key, -1)}
                      disabled={index === 0}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
                      aria-label={`Move ${meta?.label} up`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(key, 1)}
                      disabled={index === settings.sectionOrder.length - 1}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
                      aria-label={`Move ${meta?.label} down`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSection(key)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                      aria-label={hidden ? `Show ${meta?.label}` : `Hide ${meta?.label}`}
                    >
                      {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard
            icon={Printer}
            title="Live preview"
            description="Exactly what prints. Dashed line marks the start of page two."
            tone="emerald"
            actions={
              <>
                <Chip tone={pageCount > 1 ? "amber" : "emerald"}>
                  {pageCount} {pageCount === 1 ? "page" : "pages"}
                </Chip>
                <Chip tone="violet">{page.label}</Chip>
              </>
            }
          >
            {hasContent ? (
              <div
                ref={previewWrapRef}
                className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                style={{ height: Math.max(260, docHeight * scale) }}
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                  <div ref={pageRef}>
                    <ResumeDocument data={data} settings={settings} />
                  </div>
                </div>
                {docHeight > page.height && (
                  <div
                    className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-rose-400/80"
                    style={{ top: page.height * scale }}
                  >
                    <span className="absolute right-2 top-1 rounded bg-rose-500 px-1.5 py-0.5 text-[13px] font-bold text-white">
                      Page 2
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <UserRound className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">Your resume starts blank</p>
                <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Type your name to begin, or load a complete demo resume to explore the templates and print output.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <ActionButton variant="primary" tone="emerald" icon={Wand2} onClick={loadDemo}>
                    Load demo data
                  </ActionButton>
                  <ActionButton icon={Printer} onClick={openPrintWindow} disabled>
                    Print unavailable
                  </ActionButton>
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton variant="primary" tone="emerald" icon={Printer} onClick={openPrintWindow} disabled={!hasContent}>
                Print / Save PDF
              </ActionButton>
              <ActionButton icon={Download} onClick={exportHtml} disabled={!hasContent}>
                Download HTML
              </ActionButton>
            </div>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Design" description="Templates, colour, type and spacing are saved with your draft." tone="violet">
            <div className="space-y-4">
              <div>
                <span className={labelClass}>Template</span>
                <div className="grid grid-cols-2 gap-2">
                  {RESUME_TEMPLATES.map((template) => (
                    <button
                      key={template.value}
                      type="button"
                      onClick={() => updateSetting({ template: template.value })}
                      aria-pressed={settings.template === template.value}
                      className={`rounded-xl border p-2.5 text-left transition ${
                        settings.template === template.value
                          ? "border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                      }`}
                    >
                      <span className="mb-1.5 flex h-8 w-full flex-col gap-0.5 overflow-hidden rounded-md border border-slate-200 bg-white p-1 dark:border-slate-600">
                        {template.value === "executive" && <span className="h-3 w-full rounded-sm" style={{ background: settings.accent }} />}
                        <span className="h-1 w-10 rounded-full bg-slate-800" />
                        <span className="h-0.5 w-14 rounded-full bg-slate-300" />
                        {template.value === "modern" && <span className="mt-0.5 h-0.5 w-full rounded-full" style={{ background: settings.accent }} />}
                      </span>
                      <span className="block text-sm font-black text-slate-900 dark:text-white">{template.label}</span>
                      <span className="block text-[13px] text-slate-500 dark:text-slate-400">{template.blurb}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {RESUME_TEMPLATES.find((template) => template.value === settings.template)?.description}
                </p>
              </div>

              <div>
                <span className={labelClass}>Accent colour</span>
                <div className="flex flex-wrap gap-2">
                  {RESUME_ACCENTS.map((accent) => (
                    <button
                      key={accent.value}
                      type="button"
                      onClick={() => updateSetting({ accent: accent.value })}
                      aria-label={`Use ${accent.label} accent`}
                      aria-pressed={settings.accent === accent.value}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        settings.accent === accent.value ? "scale-110 border-slate-900 dark:border-white" : "border-white dark:border-slate-800"
                      }`}
                      style={{ background: accent.value }}
                    />
                  ))}
                  <input
                    type="color"
                    value={settings.accent}
                    onChange={(event) => updateSetting({ accent: event.target.value })}
                    aria-label="Custom accent colour"
                    className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <span className={labelClass}>Typeface</span>
                <Segmented
                  value={settings.font}
                  onChange={(value) => updateSetting({ font: value })}
                  options={RESUME_FONTS.map((font) => ({ value: font.value, label: font.label }))}
                  columns={3}
                  tone="violet"
                />
              </div>

              <SliderRow
                label="Text scale"
                value={Math.round(settings.fontScale * 100)}
                min={85}
                max={115}
                step={1}
                onChange={(value) => updateSetting({ fontScale: value / 100 })}
                format={(value) => `${value}%`}
                tone="violet"
              />

              <SliderRow
                label="Section spacing"
                value={Math.round(settings.spacing * 100)}
                min={75}
                max={140}
                step={1}
                onChange={(value) => updateSetting({ spacing: value / 100 })}
                format={(value) => `${value}%`}
                tone="violet"
              />

              <div>
                <span className={labelClass}>Page size</span>
                <Segmented
                  value={settings.pageSize}
                  onChange={(value) => updateSetting({ pageSize: value })}
                  options={[
                    { value: "a4", label: "A4" },
                    { value: "letter", label: "US Letter" },
                  ]}
                  columns={2}
                  tone="violet"
                />
              </div>

              <SliderRow
                label="Page margins"
                value={settings.margins}
                min={28}
                max={80}
                step={4}
                onChange={(value) => updateSetting({ margins: value })}
                format={(value) => `${value}px`}
                tone="violet"
              />

              <div className="space-y-2">
                <ToggleRow
                  checked={settings.showPhoto}
                  onChange={(value) => updateSetting({ showPhoto: value })}
                  label="Show profile photo"
                  description="Hide it for regions where photos are discouraged or for strict ATS applications."
                  tone="violet"
                />
                <Segmented
                  value={settings.photoShape}
                  onChange={(value) => updateSetting({ photoShape: value })}
                  options={[
                    { value: "circle", label: "Circular" },
                    { value: "rounded", label: "Rounded" },
                  ]}
                  columns={2}
                  tone="violet"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={BadgeCheck} title="Resume health" description="A quick completeness check — not a hiring prediction." tone="sky">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">{score}</span>
              <div className="min-w-0 flex-1">
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-teal-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="mt-1 text-[13px] font-semibold text-slate-500 dark:text-slate-400">out of 100</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
              {tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Stat label="Roles" value={data.experience.length} tone="emerald" />
              <Stat label="Skills" value={data.skills.length} tone="violet" />
              <Stat label="Pages" value={pageCount} tone={pageCount > 1 ? "amber" : "sky"} />
            </div>
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Job description match"
            description="Paste an advert to see which keywords your resume already covers."
            tone="amber"
            actions={
              <ActionButton variant="ghost" onClick={() => setShowJobMatch((value) => !value)}>
                {showJobMatch ? "Hide" : "Open"}
              </ActionButton>
            }
          >
            {showJobMatch ? (
              <div className="space-y-3">
                <textarea
                  value={jobText}
                  onChange={(event) => setJobText(event.target.value)}
                  rows={5}
                  placeholder="Paste the job advert here…"
                  className={`${fieldClass(false, "amber")} resize-y`}
                />
                {jobText.trim() ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                      <Chip tone="emerald">{match.matched.length} matched</Chip>
                      <Chip tone="amber">{match.missing.length} missing</Chip>
                    </div>
                    {match.matched.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">You already mention</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {match.matched.slice(0, 18).map((word) => (
                            <span
                              key={word}
                              className="rounded-full bg-emerald-50 px-2.5 py-1 text-[13px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {match.missing.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Worth adding if true</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {match.missing.slice(0, 18).map((word) => (
                            <span
                              key={word}
                              className="rounded-full bg-amber-50 px-2.5 py-1 text-[13px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <Callout tone="amber" variant="warning" title="Use judgement">
                      Only add keywords for skills you genuinely have. This panel matches words — it does not understand
                      seniority or context.
                    </Callout>
                  </>
                ) : (
                  <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Nothing is compared until you paste an advert. Your job description stays in this browser.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                Tailoring matters. Open this panel to compare your resume against a specific job advert before exporting.
              </p>
            )}
          </SectionCard>

          <Callout tone="emerald" variant="success" title="Autosaved locally">
            Your draft, design settings and photo are stored in this browser. Export JSON for a portable backup.
          </Callout>
        </div>
      </div>

      <FaqAccordion items={RESUME_FAQS} tone="emerald" />
    </div>
  );
}
