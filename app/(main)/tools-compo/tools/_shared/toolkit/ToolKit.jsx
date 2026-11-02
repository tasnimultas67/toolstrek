"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Info,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Shared design tokens                                                      */
/*  Every text size in these tools is 14px or larger on laptop screens.       */
/* -------------------------------------------------------------------------- */

export const ACCENTS = {
  indigo: {
    chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    soft: "border-indigo-100 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/25",
    text: "text-indigo-700 dark:text-indigo-300",
    solid: "bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-indigo-600",
    ring: "focus:ring-indigo-500/30 focus:border-indigo-500",
    accent: "accent-indigo-600",
    bar: "from-indigo-500 via-violet-500 to-fuchsia-500",
    shadow: "shadow-indigo-500/20",
    hero: "from-indigo-600 via-violet-600 to-fuchsia-600",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    soft: "border-emerald-100 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25",
    text: "text-emerald-700 dark:text-emerald-300",
    solid: "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600",
    ring: "focus:ring-emerald-500/30 focus:border-emerald-500",
    accent: "accent-emerald-600",
    bar: "from-emerald-500 via-teal-500 to-cyan-500",
    shadow: "shadow-emerald-500/20",
    hero: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  sky: {
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    soft: "border-sky-100 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/25",
    text: "text-sky-700 dark:text-sky-300",
    solid: "bg-sky-600 hover:bg-sky-700 focus-visible:outline-sky-600",
    ring: "focus:ring-sky-500/30 focus:border-sky-500",
    accent: "accent-sky-600",
    bar: "from-sky-500 via-cyan-500 to-teal-500",
    shadow: "shadow-sky-500/20",
    hero: "from-sky-600 via-cyan-600 to-teal-600",
  },
};

export function accent(name) {
  return ACCENTS[name] || ACCENTS.indigo;
}

export const labelClass =
  "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export function fieldClass(error, tone = "indigo") {
  const ring = accent(tone).ring;
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 [color-scheme:light] dark:[color-scheme:dark] ${
    error
      ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
      : `border-slate-200 dark:border-slate-700 ${ring}`
  }`;
}

/* -------------------------------------------------------------------------- */
/*  Layout blocks                                                             */
/* -------------------------------------------------------------------------- */

export function SectionCard({
  icon: Icon,
  title,
  description,
  tone = "indigo",
  actions,
  children,
  className = "",
  bodyClassName = "",
}) {
  const palette = accent(tone);
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${palette.chip}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            <div>
              {title && (
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 max-w-2xl text-sm leading-snug text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={title || actions ? `mt-4 ${bodyClassName}` : bodyClassName}>{children}</div>
    </section>
  );
}

export function Field({ label, hint, htmlFor, aside, required, children, className = "" }) {
  return (
    <div className={className}>
      {(label || aside) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label ? (
            <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {label}
              {required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
          ) : (
            <span />
          )}
          {aside}
        </div>
      )}
      {children}
      {hint && (
        <p className="mt-1.5 text-sm leading-snug text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export function Callout({
  tone = "indigo",
  variant = "info",
  title,
  children,
  className = "",
}) {
  const palette = accent(tone);
  const iconMap = { info: Info, tip: Lightbulb, warning: AlertTriangle, success: CheckCircle2 };
  const Icon = iconMap[variant] || Info;
  const variants = {
    info: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300",
    tip: palette.soft,
    warning:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-sm leading-relaxed ${variants[variant]} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="font-bold">{title}</p>}
        <div className={title ? "mt-0.5" : ""}>{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Controls                                                                  */
/* -------------------------------------------------------------------------- */

export function Segmented({ label, value, options, onChange, columns, className = "", tone = "indigo" }) {
  const cols = columns || Math.min(options.length, 4);
  const palette = accent(tone);
  return (
    <div className={className}>
      {label && <span className={labelClass}>{label}</span>}
      <div
        role="group"
        aria-label={label}
        className="grid gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold transition ${
                active
                  ? `bg-white shadow-sm dark:bg-slate-700 ${palette.text}`
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {option.icon}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ToggleRow({ checked, onChange, label, description, tone = "indigo" }) {
  const palette = accent(tone);
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        {description && (
          <p className="mt-0.5 text-sm leading-snug text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? palette.solid.split(" ")[0] : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export function SliderRow({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  format = (v) => v,
  hint,
  tone = "indigo",
  onReset,
}) {
  const palette = accent(tone);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-sm font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {format(value)}
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={`Reset ${label}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700 ${palette.accent}`}
      />
      {hint && <p className="mt-1 text-sm leading-snug text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function NumberStepper({ value, onChange, min = 0, max = 100, step = 1, label, suffix }) {
  const clampValue = (next) => Math.min(max, Math.max(min, next));
  return (
    <div>
      {label && <span className={labelClass}>{label}</span>}
      <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80">
        <button
          type="button"
          onClick={() => onChange(clampValue(Number(value) - step))}
          className="flex w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label={`Decrease ${label || "value"}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 border-x border-slate-200 px-2 dark:border-slate-700">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => onChange(event.target.value === "" ? "" : clampValue(Number(event.target.value)))}
            aria-label={label}
            className="w-full bg-transparent py-2 text-center text-sm font-bold tabular-nums text-slate-900 outline-none dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
          />
          {suffix && <span className="shrink-0 text-sm font-medium text-slate-400">{suffix}</span>}
        </div>
        <button
          type="button"
          onClick={() => onChange(clampValue(Number(value) + step))}
          className="flex w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label={`Increase ${label || "value"}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Buttons, stats and small pieces                                           */
/* -------------------------------------------------------------------------- */

export function ActionButton({
  variant = "secondary",
  tone = "indigo",
  icon: Icon,
  children,
  className = "",
  ...props
}) {
  const palette = accent(tone);
  const variants = {
    primary: `text-white shadow-sm ${palette.solid} disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400`,
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800",
    ghost:
      "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
    danger:
      "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function CopyButton({ text, label = "Copy", tone = "indigo", variant = "secondary", disabled, onCopied }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(true);
      onCopied?.();
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      onCopied?.(false);
    }
  };

  return (
    <ActionButton
      variant={variant}
      tone={tone}
      icon={copied ? Check : Copy}
      onClick={handleCopy}
      disabled={disabled || !text}
    >
      {copied ? "Copied" : label}
    </ActionButton>
  );
}

export function Stat({ label, value, hint, tone = "indigo", icon: Icon }) {
  const palette = accent(tone);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex items-center gap-1.5">
        {Icon && (
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${palette.chip}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-lg font-black leading-tight text-slate-900 tabular-nums dark:text-white">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-sm leading-snug text-slate-400">{hint}</p>}
    </div>
  );
}

export function Chip({ children, tone = "indigo", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${accent(tone).chip} ${className}`}
    >
      {children}
    </span>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1 text-sm font-semibold text-rose-600 dark:text-rose-400">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export function FaqAccordion({ items, title = "Frequently asked questions", tone = "indigo" }) {
  const palette = accent(tone);
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <details key={item.question} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-2.5 text-sm font-bold text-slate-800 transition hover:text-slate-950 dark:text-slate-200 dark:hover:text-white [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform group-open:rotate-180 ${palette.text}`} />
            </summary>
            <p className="pb-3 pr-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

export function Hero({
  eyebrow,
  icon: Icon,
  title,
  description,
  badges = [],
  tone = "indigo",
  children,
}) {
  const palette = accent(tone);
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${palette.hero} p-6 text-white shadow-xl ${palette.shadow} sm:p-9`}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
          {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
          {eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">{description}</p>
        {badges.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-sm font-semibold text-white/95 backdrop-blur-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-white/80" aria-hidden="true" />
                {badge}
              </span>
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export const Panel = SectionCard;
