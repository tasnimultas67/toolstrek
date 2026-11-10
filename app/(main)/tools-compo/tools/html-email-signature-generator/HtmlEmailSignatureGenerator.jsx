"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Braces,
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  FileText,
  Image as ImageIcon,
  Info,
  LayoutTemplate,
  Mail,
  Minus,
  Monitor,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Share2,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Trash2,
  Type,
  Upload,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  CopyButton,
  FaqAccordion,
  Field,
  FieldError,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText } from "../_shared/toolkit/toolUtils";
import {
  DEFAULT_SIGNATURE,
  DIVIDER_STYLE_OPTIONS,
  FONT_OPTIONS,
  LAYOUT_OPTIONS,
  PHOTO_SHAPE_OPTIONS,
  SIGNATURE_FAQS,
  SOCIAL_NETWORKS,
  SOCIAL_STYLE_OPTIONS,
  TEMPLATES,
  buildPlainText,
  buildSignatureHtml,
  buildVcard,
  escapeHtml,
  isValidEmail,
  isValidUrl,
} from "./signatureData";

const TOOL_META = {
  title: "HTML Email Signature Generator",
  link: "/tools/html-email-signature-generator",
  icon: "Mail",
};

const TONE = "violet";

const TABS = [
  { value: "design", label: "Design", icon: Palette },
  { value: "content", label: "Content", icon: FileText },
  { value: "social", label: "Social & CTA", icon: Share2 },
  { value: "export", label: "Export", icon: Download },
];

function ColorField({ id, label, value, onChange, hint }) {
  const safeValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="flex items-stretch gap-2">
        <input
          type="color"
          aria-label={`${label} colour picker`}
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          placeholder="#7c3aed"
          className={`${fieldClass(false, TONE)} font-mono uppercase`}
        />
      </div>
    </Field>
  );
}

function ImageField({ id, label, value, onChange, onUpload, onClear, hint, previewClass = "" }) {
  const inputRef = useRef(null);
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="flex items-start gap-3">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 ${previewClass}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={id}
            value={value.startsWith("data:") ? "" : value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={value.startsWith("data:") ? "Embedded image — paste a URL to replace it" : "https://example.com/photo.jpg"}
            spellCheck={false}
            className={`${fieldClass(false, TONE)} font-mono`}
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => onUpload(event.target.files?.[0])}
            />
            <ActionButton icon={Upload} onClick={() => inputRef.current?.click()}>
              Upload
            </ActionButton>
            <ActionButton icon={Trash2} variant="ghost" onClick={onClear}>
              Remove
            </ActionButton>
          </div>
        </div>
      </div>
    </Field>
  );
}

function SocialRow({ item, index, onChange, onRemove }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="grid gap-2 sm:grid-cols-[170px_1fr_auto] sm:items-end">
        <Field label={`Network ${index + 1}`} htmlFor={`social-network-${item.id}`}>
          <select
            id={`social-network-${item.id}`}
            value={item.network}
            onChange={(event) => {
              const network = SOCIAL_NETWORKS.find((option) => option.id === event.target.value);
              onChange({ network: event.target.value, label: network?.label || item.label });
            }}
            className={fieldClass(false, TONE)}
          >
            {SOCIAL_NETWORKS.map((network) => (
              <option key={network.id} value={network.id}>
                {network.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="URL" htmlFor={`social-url-${item.id}`}>
          <input
            id={`social-url-${item.id}`}
            value={item.url}
            onChange={(event) => onChange({ url: event.target.value })}
            placeholder="https://linkedin.com/in/you"
            spellCheck={false}
            className={`${fieldClass(false, TONE)} font-mono`}
          />
        </Field>
        <ActionButton icon={Trash2} variant="danger" onClick={onRemove} aria-label="Remove social link">
          Remove
        </ActionButton>
      </div>
      <div className="mt-2">
        <Field label="Link label" htmlFor={`social-label-${item.id}`} hint="Used for tooltips and the text-link style.">
          <input
            id={`social-label-${item.id}`}
            value={item.label}
            onChange={(event) => onChange({ label: event.target.value })}
            className={fieldClass(false, TONE)}
          />
        </Field>
      </div>
    </div>
  );
}

export default function HtmlEmailSignatureGenerator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("design");
  const [sig, setSig] = useState(DEFAULT_SIGNATURE);
  const [previewKind, setPreviewKind] = useState("rich");
  const [previewWidth, setPreviewWidth] = useState("desktop");
  const [previewDark, setPreviewDark] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const set = (key, value) => setSig((current) => ({ ...current, [key]: value }));

  const errors = useMemo(() => {
    const next = {};
    if (!sig.name.trim()) next.name = "Add a name so the signature has a clear owner.";
    if (sig.email && !isValidEmail(sig.email)) next.email = "Use a valid address such as name@company.com.";
    if (sig.website && !isValidUrl(sig.website)) next.website = "Enter a domain or a full https:// URL.";
    if (sig.showCta && sig.ctaUrl && !isValidUrl(sig.ctaUrl)) next.ctaUrl = "Enter a valid button destination.";
    (sig.socials || []).forEach((social) => {
      if (social.url && !isValidUrl(social.url)) {
        next[`social-${social.id}`] = "This social URL does not look valid.";
      }
    });
    return next;
  }, [sig]);

  const errorCount = Object.keys(errors).length;

  const html = useMemo(() => buildSignatureHtml(sig), [sig]);
  const plain = useMemo(() => buildPlainText(sig), [sig]);
  const vcard = useMemo(() => buildVcard(sig), [sig]);

  const previewDoc = useMemo(
    () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body{margin:0;padding:0;}
  body{padding:20px;background:${previewDark ? "#0b1120" : "#f1f5f9"};font-family:Arial,Helvetica,sans-serif;}
  .preview-wrap{display:flex;justify-content:center;align-items:flex-start;}
  .preview-card{width:100%;max-width:100%;padding:18px;border-radius:18px;background:${previewDark ? "#111827" : "#ffffff"};box-shadow:0 14px 40px rgba(15,23,42,0.12);}
  img{max-width:100%;height:auto;}
  a{word-break:break-word;}
</style>
</head>
<body>
  <div class="preview-wrap"><div class="preview-card">${html}</div></div>
</body>
</html>`,
    [html, previewDark],
  );

  const handleUpload = (key, file, label) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type)) {
      toast.error("Choose a PNG, JPEG, WebP or GIF image.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("That image is larger than 1.5 MB. Compress it first for reliable email delivery.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set(key, String(reader.result || ""));
      toast.success(`${label} embedded. Host it on HTTPS for production signatures.`);
    };
    reader.onerror = () => toast.error(`Could not read that ${label.toLowerCase()}.`);
    reader.readAsDataURL(file);
  };

  const handleRichCopy = async () => {
    try {
      if (navigator.clipboard && typeof window !== "undefined" && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          }),
        ]);
        toast.success("Rich signature copied. Paste it into your email client's signature editor.");
        return;
      }
      await navigator.clipboard.writeText(html);
      toast.success("HTML copied to the clipboard.");
    } catch {
      downloadText(html, "email-signature.html", "text/html;charset=utf-8");
      toast.error("Rich copy was blocked. An HTML file was downloaded instead.");
    }
  };

  const downloadHtml = () => {
    const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(sig.name || "Email signature")} — signature</title>
</head>
<body style="margin:24px;background:#f8fafc;">
${html}
</body>
</html>`;
    downloadText(document, "email-signature.html", "text/html;charset=utf-8");
    toast.success("Standalone HTML file downloaded.");
  };

  const downloadJson = () => {
    downloadText(
      JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), signature: sig }, null, 2),
      "email-signature-config.json",
      "application/json;charset=utf-8",
    );
    toast.success("Configuration downloaded.");
  };

  const importJson = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const payload = parsed.signature && typeof parsed.signature === "object" ? parsed.signature : parsed;
        if (!payload || typeof payload !== "object") throw new Error("Invalid payload");
        setSig({ ...DEFAULT_SIGNATURE, ...payload, socials: payload.socials || DEFAULT_SIGNATURE.socials });
        toast.success("Signature configuration imported.");
      } catch {
        toast.error("That file is not a valid signature configuration.");
      }
    };
    reader.onerror = () => toast.error("Could not read that JSON file.");
    reader.readAsText(file);
  };

  const addSocial = () => {
    const id = `social-${Date.now()}`;
    setSig((current) => ({
      ...current,
      socials: [...current.socials, { id, network: "linkedin", label: "LinkedIn", url: "" }],
    }));
  };

  const updateSocial = (index, patch) => {
    setSig((current) => ({
      ...current,
      socials: current.socials.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  };

  const removeSocial = (index) => {
    setSig((current) => ({
      ...current,
      socials: current.socials.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetAll = () => {
    setSig(DEFAULT_SIGNATURE);
    toast.success("Signature reset to the default design.");
  };

  const previewWidthClass =
    previewWidth === "mobile" ? "max-w-[360px]" : previewWidth === "tablet" ? "max-w-[480px]" : "max-w-[680px]";

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Email identity studio"
        icon={Mail}
        title="HTML Email Signature Generator"
        description="Design a professional email signature with a live, email-safe preview. Control layout, typography, colours, photo shape, social links, call-to-action buttons and legal text, then copy rich HTML into Gmail, Outlook, Apple Mail or Office 365."
        badges={[
          "Email-safe table layout",
          "5 templates",
          "Live desktop & mobile preview",
          "Rich copy for Gmail & Outlook",
          "vCard + JSON export",
          "100% private",
        ]}
      />

      <div
        role="tablist"
        aria-label="Signature generator sections"
        className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4"
      >
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-bold transition ${
              tab === value
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {errorCount > 0 && (
        <Callout tone="amber" variant="warning" title={`${errorCount} field${errorCount === 1 ? " needs" : "s need"} attention`}>
          The preview still updates so you can experiment, but fix the highlighted fields before installing the
          signature for real use.
        </Callout>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          {tab === "design" && (
            <>
              <SectionCard
                tone={TONE}
                icon={LayoutTemplate}
                title="Template"
                description="Start from a layout, then refine every detail below. Templates are presets, not locked designs."
              >
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.value}
                      type="button"
                      onClick={() => set("template", template.value)}
                      aria-pressed={sig.template === template.value}
                      className={`rounded-2xl border p-3 text-left transition ${
                        sig.template === template.value
                          ? "border-violet-500 bg-violet-50/80 ring-2 ring-violet-500/20 dark:border-violet-500 dark:bg-violet-950/30"
                          : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{template.label}</span>
                        {sig.template === template.value && (
                          <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-300" aria-hidden="true" />
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-snug text-slate-500 dark:text-slate-400">
                        {template.description}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Segmented
                    label="Photo placement"
                    tone={TONE}
                    columns={3}
                    value={sig.layout}
                    onChange={(value) => set("layout", value)}
                    options={LAYOUT_OPTIONS}
                  />
                  <Segmented
                    label="Photo shape"
                    tone={TONE}
                    columns={3}
                    value={sig.photoShape}
                    onChange={(value) => set("photoShape", value)}
                    options={PHOTO_SHAPE_OPTIONS}
                  />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Type} title="Typography" description="Every size is kept at 14px or larger for comfortable reading.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Font family" htmlFor="sig-font">
                    <select id="sig-font" value={sig.fontFamily} onChange={(event) => set("fontFamily", event.target.value)} className={fieldClass(false, TONE)}>
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Name weight" htmlFor="sig-name-weight">
                    <select id="sig-name-weight" value={sig.nameWeight} onChange={(event) => set("nameWeight", event.target.value)} className={fieldClass(false, TONE)}>
                      <option value="400">Regular</option>
                      <option value="600">Semi-bold</option>
                      <option value="700">Bold</option>
                      <option value="800">Extra bold</option>
                      <option value="900">Black</option>
                    </select>
                  </Field>
                  <SliderRow tone={TONE} label="Body text size" min={14} max={24} value={sig.baseSize} onChange={(value) => set("baseSize", value)} format={(value) => `${value}px`} onReset={() => set("baseSize", 14)} />
                  <SliderRow tone={TONE} label="Name size" min={16} max={40} value={sig.nameSize} onChange={(value) => set("nameSize", value)} format={(value) => `${value}px`} onReset={() => set("nameSize", 20)} />
                  <SliderRow tone={TONE} label="Line height" min={1.2} max={2} step={0.05} value={sig.lineHeight} onChange={(value) => set("lineHeight", value)} format={(value) => value.toFixed(2)} onReset={() => set("lineHeight", 1.5)} />
                  <Segmented
                    label="Name casing"
                    tone={TONE}
                    columns={3}
                    value={sig.nameTransform}
                    onChange={(value) => set("nameTransform", value)}
                    options={[
                      { value: "none", label: "Normal" },
                      { value: "capitalize", label: "Title" },
                      { value: "uppercase", label: "UPPER" },
                    ]}
                  />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Palette} title="Colours" description="Use the picker or paste a hex value. A preview updates instantly.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField id="accent-color" label="Accent" value={sig.accentColor} onChange={(value) => set("accentColor", value)} />
                  <ColorField id="heading-color" label="Name colour" value={sig.headingColor} onChange={(value) => set("headingColor", value)} />
                  <ColorField id="text-color" label="Body text" value={sig.textColor} onChange={(value) => set("textColor", value)} />
                  <ColorField id="muted-color" label="Labels & muted text" value={sig.mutedColor} onChange={(value) => set("mutedColor", value)} />
                  <ColorField id="background-color" label="Signature background" value={sig.backgroundColor} onChange={(value) => set("backgroundColor", value)} />
                  <ColorField id="border-color" label="Borders & dividers base" value={sig.borderColor} onChange={(value) => set("borderColor", value)} />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Sparkles} title="Spacing & frame" description="Fine-tune the dimensions of the signature card.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SliderRow tone={TONE} label="Maximum width" min={320} max={760} step={10} value={sig.width} onChange={(value) => set("width", value)} format={(value) => `${value}px`} onReset={() => set("width", 480)} />
                  <SliderRow tone={TONE} label="Padding" min={0} max={48} value={sig.padding} onChange={(value) => set("padding", value)} format={(value) => `${value}px`} onReset={() => set("padding", 20)} />
                  <SliderRow tone={TONE} label="Corner radius" min={0} max={32} value={sig.radius} onChange={(value) => set("radius", value)} format={(value) => `${value}px`} onReset={() => set("radius", 12)} />
                  <SliderRow tone={TONE} label="Element spacing" min={4} max={28} value={sig.spacing} onChange={(value) => set("spacing", value)} format={(value) => `${value}px`} onReset={() => set("spacing", 10)} />
                </div>
                <div className="mt-3">
                  <ToggleRow tone={TONE} checked={sig.showBorder} onChange={(value) => set("showBorder", value)} label="Draw an outer border" description="A subtle 1px frame around the signature." />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={ImageIcon} title="Photo & logo" description="Use an HTTPS URL for production. Uploads are embedded for preview only.">
                <div className="space-y-4">
                  <ToggleRow tone={TONE} checked={sig.showPhoto} onChange={(value) => set("showPhoto", value)} label="Show a profile photo" description="Without an image, a coloured monogram is generated automatically." />
                  {sig.showPhoto && (
                    <>
                      <ImageField
                        id="sig-photo"
                        label="Profile photo"
                        value={sig.photo}
                        onChange={(value) => set("photo", value)}
                        onUpload={(file) => handleUpload("photo", file, "Profile photo")}
                        onClear={() => set("photo", "")}
                        hint="Square images work best. 200–400px is plenty."
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <SliderRow tone={TONE} label="Photo size" min={40} max={160} value={sig.photoSize} onChange={(value) => set("photoSize", value)} format={(value) => `${value}px`} onReset={() => set("photoSize", 88)} />
                        <Field label="Alt text" htmlFor="sig-photo-alt" hint="Read by screen readers and shown if images are blocked.">
                          <input id="sig-photo-alt" value={sig.photoAlt} onChange={(event) => set("photoAlt", event.target.value)} className={fieldClass(false, TONE)} />
                        </Field>
                      </div>
                    </>
                  )}

                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    <ToggleRow tone={TONE} checked={sig.showLogo} onChange={(value) => set("showLogo", value)} label="Show a company logo" description="Displayed beside your name in classic, card and banner templates." />
                  </div>
                  {sig.showLogo && (
                    <>
                      <ImageField
                        id="sig-logo"
                        label="Company logo"
                        value={sig.logo}
                        onChange={(value) => set("logo", value)}
                        onUpload={(file) => handleUpload("logo", file, "Logo")}
                        onClear={() => set("logo", "")}
                        hint="A transparent PNG or SVG-as-PNG works best."
                      />
                      <SliderRow tone={TONE} label="Logo size" min={24} max={120} value={sig.logoSize} onChange={(value) => set("logoSize", value)} format={(value) => `${value}px`} onReset={() => set("logoSize", 44)} />
                    </>
                  )}
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Minus} title="Divider" description="A divider separates identity from contact details and links.">
                <ToggleRow tone={TONE} checked={sig.showDivider} onChange={(value) => set("showDivider", value)} label="Show divider" description="Works well with the classic, modern and card templates." />
                {sig.showDivider && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Segmented label="Style" tone={TONE} columns={4} value={sig.dividerStyle} onChange={(value) => set("dividerStyle", value)} options={DIVIDER_STYLE_OPTIONS} />
                    <SliderRow tone={TONE} label="Thickness" min={1} max={6} value={sig.dividerThickness} onChange={(value) => set("dividerThickness", value)} format={(value) => `${value}px`} onReset={() => set("dividerThickness", 2)} />
                    <SliderRow tone={TONE} label="Width" min={10} max={100} step={5} value={sig.dividerWidth} onChange={(value) => set("dividerWidth", value)} format={(value) => `${value}%`} onReset={() => set("dividerWidth", 100)} />
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {tab === "content" && (
            <>
              <SectionCard tone={TONE} icon={UserRound} title="Identity" description="The name, role and company recipients see first.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="sig-name" required>
                    <input id="sig-name" value={sig.name} onChange={(event) => set("name", event.target.value)} className={fieldClass(Boolean(errors.name), TONE)} />
                    <FieldError>{errors.name}</FieldError>
                  </Field>
                  <Field label="Pronouns" htmlFor="sig-pronouns" hint="Shown in parentheses after the name.">
                    <input id="sig-pronouns" value={sig.pronouns} onChange={(event) => set("pronouns", event.target.value)} placeholder="they/them" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Job title" htmlFor="sig-role">
                    <input id="sig-role" value={sig.role} onChange={(event) => set("role", event.target.value)} className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Company" htmlFor="sig-company">
                    <input id="sig-company" value={sig.company} onChange={(event) => set("company", event.target.value)} className={fieldClass(false, TONE)} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Tagline" htmlFor="sig-tagline" hint="One short line about what you do. Keep it under 90 characters.">
                    <input id="sig-tagline" value={sig.tagline} onChange={(event) => set("tagline", event.target.value)} className={fieldClass(false, TONE)} />
                  </Field>
                </div>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  <ToggleRow tone={TONE} checked={sig.showPronouns} onChange={(value) => set("showPronouns", value)} label="Show pronouns" />
                  <ToggleRow tone={TONE} checked={sig.showCompany} onChange={(value) => set("showCompany", value)} label="Show company" />
                  <ToggleRow tone={TONE} checked={sig.showTagline} onChange={(value) => set("showTagline", value)} label="Show tagline" />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Mail} title="Contact details" description="Phone, email and website become clickable links automatically.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" htmlFor="sig-email">
                    <input id="sig-email" type="email" value={sig.email} onChange={(event) => set("email", event.target.value)} className={fieldClass(Boolean(errors.email), TONE)} />
                    <FieldError>{errors.email}</FieldError>
                  </Field>
                  <Field label="Phone" htmlFor="sig-phone">
                    <input id="sig-phone" value={sig.phone} onChange={(event) => set("phone", event.target.value)} className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Website" htmlFor="sig-website">
                    <input id="sig-website" value={sig.website} onChange={(event) => set("website", event.target.value)} className={fieldClass(Boolean(errors.website), TONE)} />
                    <FieldError>{errors.website}</FieldError>
                  </Field>
                  <Field label="Office address" htmlFor="sig-address">
                    <input id="sig-address" value={sig.address} onChange={(event) => set("address", event.target.value)} className={fieldClass(false, TONE)} />
                  </Field>
                </div>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <ToggleRow tone={TONE} checked={sig.showLabels} onChange={(value) => set("showLabels", value)} label="Show field labels" description="Adds Email:, Phone:, Web: and Address: before each value." />
                  <ToggleRow tone={TONE} checked={sig.showAddress} onChange={(value) => set("showAddress", value)} label="Show address" />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Sparkles} title="Availability & badge" description="Optional trust signals that sit below your contact details.">
                <div className="space-y-3">
                  <ToggleRow tone={TONE} checked={sig.showAvailability} onChange={(value) => set("showAvailability", value)} label="Show availability pill" description="Great for freelancers and people open to new work." />
                  {sig.showAvailability && (
                    <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                      <Field label="Availability text" htmlFor="sig-availability">
                        <input id="sig-availability" value={sig.availabilityText} onChange={(event) => set("availabilityText", event.target.value)} className={fieldClass(false, TONE)} />
                      </Field>
                      <ColorField id="sig-availability-color" label="Pill colour" value={sig.availabilityColor} onChange={(value) => set("availabilityColor", value)} />
                    </div>
                  )}
                  <ToggleRow tone={TONE} checked={sig.showBadge} onChange={(value) => set("showBadge", value)} label="Show a small badge line" description="A short credential, certification or sustainability note." />
                  {sig.showBadge && (
                    <Field label="Badge text" htmlFor="sig-badge">
                      <input id="sig-badge" value={sig.badgeText} onChange={(event) => set("badgeText", event.target.value)} className={fieldClass(false, TONE)} />
                    </Field>
                  )}
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={FileText} title="Legal disclaimer" description="Keep confidentiality or compliance text at a readable size.">
                <ToggleRow tone={TONE} checked={sig.showDisclaimer} onChange={(value) => set("showDisclaimer", value)} label="Show disclaimer" description="Displayed below a subtle rule in classic, card and banner templates." />
                {sig.showDisclaimer && (
                  <div className="mt-4">
                    <Field
                      label="Disclaimer text"
                      htmlFor="sig-disclaimer"
                      aside={<span className="text-sm font-medium text-slate-400">{sig.disclaimer.length} characters</span>}
                      hint="Some organisations require specific wording. Check with your legal or compliance team."
                    >
                      <textarea
                        id="sig-disclaimer"
                        rows={5}
                        value={sig.disclaimer}
                        onChange={(event) => set("disclaimer", event.target.value)}
                        className={`${fieldClass(false, TONE)} resize-y leading-relaxed`}
                      />
                    </Field>
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {tab === "social" && (
            <>
              <SectionCard
                tone={TONE}
                icon={Share2}
                title="Social links"
                description="Add the networks you actually use. Remove anything that makes the signature feel cluttered."
                actions={
                  <ActionButton icon={Plus} variant="primary" tone={TONE} onClick={addSocial}>
                    Add link
                  </ActionButton>
                }
              >
                <ToggleRow tone={TONE} checked={sig.showSocial} onChange={(value) => set("showSocial", value)} label="Show social links" description="Three styles are available: icon tiles, rounded pills or plain text links." />
                {sig.showSocial && (
                  <>
                    <div className="mt-4">
                      <Segmented label="Link style" tone={TONE} columns={3} value={sig.socialStyle} onChange={(value) => set("socialStyle", value)} options={SOCIAL_STYLE_OPTIONS} />
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {sig.socials.length === 0 && (
                        <Callout tone={TONE} variant="info">
                          No social links yet. Add one, or turn off social links entirely.
                        </Callout>
                      )}
                      {sig.socials.map((social, index) => (
                        <div key={social.id}>
                          <SocialRow
                            item={social}
                            index={index}
                            onChange={(patch) => updateSocial(index, patch)}
                            onRemove={() => removeSocial(index)}
                          />
                          {errors[`social-${social.id}`] && <FieldError>{errors[`social-${social.id}`]}</FieldError>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>

              <SectionCard tone={TONE} icon={Sparkles} title="Call-to-action button" description="Give recipients one clear next step, such as booking a call or viewing your portfolio.">
                <ToggleRow tone={TONE} checked={sig.showCta} onChange={(value) => set("showCta", value)} label="Show CTA button" description="Rendered as a bulletproof link with inline styles." />
                {sig.showCta && (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Button text" htmlFor="sig-cta-text">
                        <input id="sig-cta-text" value={sig.ctaText} onChange={(event) => set("ctaText", event.target.value)} className={fieldClass(false, TONE)} />
                      </Field>
                      <Field label="Button URL" htmlFor="sig-cta-url">
                        <input id="sig-cta-url" value={sig.ctaUrl} onChange={(event) => set("ctaUrl", event.target.value)} className={fieldClass(Boolean(errors.ctaUrl), TONE)} />
                        <FieldError>{errors.ctaUrl}</FieldError>
                      </Field>
                      <ColorField id="sig-cta-bg" label="Button background" value={sig.ctaBg} onChange={(value) => set("ctaBg", value)} />
                      <ColorField id="sig-cta-color" label="Button text colour" value={sig.ctaColor} onChange={(value) => set("ctaColor", value)} />
                    </div>
                    <SliderRow tone={TONE} label="Button radius" min={0} max={24} value={sig.ctaRadius} onChange={(value) => set("ctaRadius", value)} format={(value) => `${value}px`} onReset={() => set("ctaRadius", 8)} />
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {tab === "export" && (
            <>
              <SectionCard tone={TONE} icon={Download} title="Install & export" description="Copy rich HTML for your email client, or download files for later.">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <ActionButton icon={Copy} variant="primary" tone={TONE} onClick={handleRichCopy}>
                    Copy rich signature
                  </ActionButton>
                  <CopyButton text={html} tone={TONE} label="Copy HTML source" />
                  <CopyButton text={plain} tone={TONE} label="Copy plain text" />
                  <ActionButton icon={FileText} onClick={downloadHtml}>
                    Download .html
                  </ActionButton>
                  <ActionButton icon={FileJson} onClick={downloadJson}>
                    Download JSON
                  </ActionButton>
                  <ActionButton
                    icon={UserRound}
                    onClick={() => {
                      downloadText(vcard, "contact.vcf", "text/vcard;charset=utf-8");
                      toast.success("vCard downloaded.");
                    }}
                  >
                    Download vCard
                  </ActionButton>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <input
                    ref={importRef}
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    onChange={(event) => importJson(event.target.files?.[0])}
                  />
                  <ActionButton icon={Upload} onClick={() => importRef.current?.click()}>
                    Import JSON
                  </ActionButton>
                  <ActionButton icon={RotateCcw} variant="danger" onClick={resetAll}>
                    Reset everything
                  </ActionButton>
                </div>

                <Callout tone={TONE} variant="tip" className="mt-4" title="Best result">
                  Use <strong>Copy rich signature</strong> and paste into the signature editor. If a client strips the
                  formatting, use the downloaded HTML file or paste the source into an HTML-aware editor.
                </Callout>
              </SectionCard>

              <SectionCard tone={TONE} icon={Braces} title="HTML source" description="Exactly what will be copied into your email client. Edit the options, not the source, to keep it valid.">
                <textarea
                  readOnly
                  value={html}
                  rows={14}
                  spellCheck={false}
                  aria-label="Generated signature HTML"
                  onFocus={(event) => event.target.select()}
                  className={`${fieldClass(false, TONE)} min-h-64 resize-y bg-slate-50 font-mono leading-relaxed dark:bg-slate-950/50`}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton text={html} tone={TONE} label="Copy HTML" />
                  <Chip tone={TONE}>{html.length.toLocaleString()} characters</Chip>
                  <Chip tone="emerald">Email-safe tables</Chip>
                  <Chip tone="sky">Inline CSS</Chip>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Smartphone} title="Client installation notes" description="The short version for the four most common clients.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Gmail",
                      body: "Settings → See all settings → General → Signature. Create one, then paste the rich signature with Ctrl/Cmd + V and save.",
                    },
                    {
                      title: "Outlook",
                      body: "Settings → Mail → Compose and reply → Signature. Paste the rich version, or import the downloaded HTML file.",
                    },
                    {
                      title: "Apple Mail",
                      body: "Mail → Settings → Signatures. Create a signature, uncheck “Always match my default message font”, then paste.",
                    },
                    {
                      title: "Thunderbird",
                      body: "Account Settings → Signature text. Paste the rich signature, or point it at the downloaded HTML file.",
                    },
                  ].map((client) => (
                    <div key={client.title} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{client.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{client.body}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}
        </div>

        <div className="space-y-6 xl:col-span-5">
          <div className="xl:sticky xl:top-24">
            <SectionCard
              tone={TONE}
              icon={Mail}
              title="Live preview"
              description="This is how the signature will look. Image blocking and client-specific quirks can still change small details."
              actions={
                <div className="flex flex-wrap gap-2">
                  <Segmented
                    tone={TONE}
                    columns={2}
                    value={previewKind}
                    onChange={setPreviewKind}
                    options={[
                      { value: "rich", label: "Rich" },
                      { value: "text", label: "Plain" },
                    ]}
                  />
                </div>
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  {[
                    { value: "desktop", label: "Desktop", icon: Monitor },
                    { value: "tablet", label: "Tablet", icon: Tablet },
                    { value: "mobile", label: "Mobile", icon: Smartphone },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPreviewWidth(value)}
                      aria-pressed={previewWidth === value}
                      title={label}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold transition ${
                        previewWidth === value
                          ? "bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
                <ActionButton
                  icon={previewDark ? Sun : Moon}
                  onClick={() => setPreviewDark((value) => !value)}
                  aria-label="Toggle preview background"
                >
                  {previewDark ? "Light" : "Dark"}
                </ActionButton>
              </div>

              <div className="mt-3 flex justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-2 dark:border-slate-800 dark:bg-slate-950">
                <div className={`w-full ${previewWidthClass} transition-all`}>
                  {previewKind === "rich" ? (
                    <iframe
                      title="Email signature preview"
                      srcDoc={previewDoc}
                      sandbox=""
                      className="h-[560px] w-full rounded-xl border-0 bg-transparent"
                    />
                  ) : (
                    <pre className="h-[560px] w-full overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {plain}
                    </pre>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Stat tone={TONE} label="HTML size" value={`${(html.length / 1024).toFixed(1)} KB`} />
                <Stat tone={TONE} label="Visible links" value={(sig.socials || []).filter((s) => s.url).length + (sig.showCta && sig.ctaUrl ? 1 : 0)} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone={TONE}>{sig.template}</Chip>
                <Chip tone="sky">{sig.baseSize}px minimum</Chip>
                {errorCount > 0 ? <Chip tone="amber">{errorCount} warning(s)</Chip> : <Chip tone="emerald">Ready to export</Chip>}
              </div>
            </SectionCard>

            <SectionCard tone={TONE} icon={Info} title="Email-safe notes" className="mt-6">
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <li>• Remote images may be blocked until the recipient chooses to load them.</li>
                <li>• Use HTTPS image URLs for production, not local paths or huge data: URLs.</li>
                <li>• Older Outlook versions ignore rounded corners and gradients.</li>
                <li>• Keep the total signature under 15 KB plus one or two small images.</li>
                <li>• Test by sending a message to yourself in each client you use.</li>
              </ul>
            </SectionCard>
          </div>
        </div>
      </div>

      <FaqAccordion items={SIGNATURE_FAQS} tone={TONE} title="Email signature questions, answered" />
    </div>
  );
}
