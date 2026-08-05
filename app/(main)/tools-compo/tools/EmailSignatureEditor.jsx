"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Youtube,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  Sliders,
  Palette,
  Type,
  Layout,
  Image,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  RefreshCw,
  Smartphone,
  Monitor,
  Info,
  Lightbulb,
  Shield,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Settings,
  FileCode,
  Share2,
  Briefcase,
  Building2,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Separator,
  X,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ToolPageShell from "../ToolPageShell";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, Geneva, Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Palatino", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: "Garamond", value: "Garamond, Baskerville, 'Baskerville Old Face', serif" },
  { label: "Gill Sans", value: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" },
];

const TEMPLATES = [
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "modern", label: "Modern", icon: "⚡" },
  { id: "minimal", label: "Minimal", icon: "✦" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "corporate", label: "Corporate", icon: "🏢" },
];

const DIVIDER_STYLES = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "double", label: "Double" },
  { value: "none", label: "None" },
];

const SOCIAL_PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin, color: "#0077B5", placeholder: "https://linkedin.com/in/yourprofile" },
  { key: "twitter", label: "Twitter / X", Icon: Twitter, color: "#1DA1F2", placeholder: "https://twitter.com/yourhandle" },
  { key: "facebook", label: "Facebook", Icon: Facebook, color: "#1877F2", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram", Icon: Instagram, color: "#E4405F", placeholder: "https://instagram.com/yourhandle" },
  { key: "github", label: "GitHub", Icon: Github, color: "#171515", placeholder: "https://github.com/yourusername" },
  { key: "youtube", label: "YouTube", Icon: Youtube, color: "#FF0000", placeholder: "https://youtube.com/@yourchannel" },
];

// ─────────────────────────────────────────────────────────
// Default State
// ─────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  // Personal Info
  name: "Alex Johnson",
  jobTitle: "Senior Product Designer",
  department: "Design & Innovation",
  company: "Nexus Creative Studio",
  email: "alex@nexuscreative.com",
  phone: "+1 (555) 890-1234",
  mobile: "+1 (555) 567-8901",
  website: "www.nexuscreative.com",
  address: "123 Innovation Drive, San Francisco, CA 94103",
  pronouns: "",

  // Social links
  social: {
    linkedin: "https://linkedin.com/in/alexjohnson",
    twitter: "",
    facebook: "",
    instagram: "",
    github: "",
    youtube: "",
  },

  // Design
  template: "professional",
  primaryColor: "#7c00fe",
  secondaryColor: "#4635b1",
  textColor: "#1a1a2e",
  bgColor: "#ffffff",
  accentColor: "#e8f5e9",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 14,
  mobileFontSize: 12,
  nameSize: 20,
  jobTitleSize: 14,
  lineHeight: 1.6,
  alignment: "left",

  // Layout
  showPhoto: true,
  photoUrl: "",
  photoShape: "circle",
  photoSize: 80,
  showLogo: false,
  logoUrl: "",
  logoWidth: 120,
  layoutDirection: "horizontal",
  showDivider: true,
  dividerStyle: "solid",
  dividerColor: "#7c00fe",
  dividerWidth: 3,
  showSocialIcons: true,
  socialIconStyle: "circle",
  socialIconSize: 24,
  showSocialColors: true,

  // Content toggles
  showEmail: true,
  showPhone: true,
  showMobile: false,
  showWebsite: true,
  showAddress: true,
  showDepartment: false,
  showPronouns: false,

  // Extra
  disclaimer: "",
  showDisclaimer: false,
  banner: "",
  bannerUrl: "",
  showBanner: false,
  cta: "",
  ctaUrl: "",
  showCta: false,
  greenBadge: false,
  schedulingLink: "",
  showSchedulingLink: false,
  customHtml: "",
  showCustomHtml: false,
  nameStyle: "bold",
  jobTitleStyle: "normal",
  emailSubjectTemplate: "",
};

// ─────────────────────────────────────────────────────────
// Helper: generate signature HTML
// ─────────────────────────────────────────────────────────
function generateSignatureHTML(sig) {
  const isHorizontal = sig.layoutDirection === "horizontal";
  const fontBase = `font-family: ${sig.fontFamily}; font-size: ${sig.fontSize}px; line-height: ${sig.lineHeight}; color: ${sig.textColor};`;
  const nameWeight = sig.nameStyle === "bold" ? "700" : sig.nameStyle === "italic" ? "400" : "600";
  const nameStyle = sig.nameStyle === "italic" ? "italic" : "normal";
  const jobWeight = sig.jobTitleStyle === "bold" ? "700" : "400";
  const jobStyle = sig.jobTitleStyle === "italic" ? "italic" : "normal";

  const photoBlock = sig.showPhoto && sig.photoUrl
    ? `<td style="padding-right: 20px; vertical-align: top;">
        <img src="${sig.photoUrl}" alt="${sig.name}" width="${sig.photoSize}" height="${sig.photoSize}" style="width: ${sig.photoSize}px; height: ${sig.photoSize}px; border-radius: ${sig.photoShape === "circle" ? "50%" : sig.photoShape === "rounded" ? "12px" : "0"}; object-fit: cover; display: block;" />
      </td>`
    : "";

  const socialLinks = SOCIAL_PLATFORMS
    .filter(p => sig.social[p.key])
    .map(p => {
      const iconColor = sig.showSocialColors ? p.color : sig.primaryColor;
      const bgStyle = sig.socialIconStyle === "circle"
        ? `background-color: ${iconColor}; border-radius: 50%; padding: 4px;`
        : sig.socialIconStyle === "square"
          ? `background-color: ${iconColor}; border-radius: 4px; padding: 4px;`
          : "";
      const imgSrc = getSocialSvg(p.key, sig.socialIconStyle === "plain" ? iconColor : "#ffffff", sig.socialIconSize);
      return `<a href="${sig.social[p.key]}" target="_blank" style="display: inline-block; margin-right: 6px; text-decoration: none;"><span style="display: inline-flex; align-items: center; justify-content: center; width: ${sig.socialIconSize + 8}px; height: ${sig.socialIconSize + 8}px; ${bgStyle}">${imgSrc}</span></a>`;
    }).join("");

  const mainInfo = `
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
      <tr>
        <td style="${fontBase}">
          <p style="margin: 0 0 2px 0; font-size: ${sig.nameSize}px; font-weight: ${nameWeight}; font-style: ${nameStyle}; color: ${sig.primaryColor}; line-height: 1.2;">${sig.name}</p>
          <p style="margin: 0 0 1px 0; font-size: ${sig.jobTitleSize}px; font-weight: ${jobWeight}; font-style: ${jobStyle}; color: ${sig.textColor};">${sig.jobTitle}${sig.showDepartment && sig.department ? ` · ${sig.department}` : ""}</p>
          ${sig.showPronouns && sig.pronouns ? `<p style="margin: 0 0 6px 0; font-size: ${sig.fontSize - 1}px; color: ${sig.textColor}; opacity: 0.7;">${sig.pronouns}</p>` : ""}
          <p style="margin: 0 0 6px 0; font-size: ${sig.fontSize}px; font-weight: 600; color: ${sig.textColor};">${sig.company}</p>
          ${sig.showDivider ? `<div style="width: 100%; height: ${sig.dividerWidth}px; background: linear-gradient(90deg, ${sig.primaryColor}, ${sig.secondaryColor}); margin: 8px 0; border-style: ${sig.dividerStyle};"></div>` : ""}
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 4px;">
            ${sig.showEmail ? `<tr><td style="padding: 2px 0;"><span style="${fontBase} font-size: ${sig.fontSize}px;">📧 <a href="mailto:${sig.email}" style="color: ${sig.primaryColor}; text-decoration: none;">${sig.email}</a></span></td></tr>` : ""}
            ${sig.showPhone ? `<tr><td style="padding: 2px 0;"><span style="${fontBase} font-size: ${sig.fontSize}px;">📞 <a href="tel:${sig.phone}" style="color: ${sig.textColor}; text-decoration: none;">${sig.phone}</a></span></td></tr>` : ""}
            ${sig.showMobile && sig.mobile ? `<tr><td style="padding: 2px 0;"><span style="${fontBase} font-size: ${sig.fontSize}px;">📱 <a href="tel:${sig.mobile}" style="color: ${sig.textColor}; text-decoration: none;">${sig.mobile}</a></span></td></tr>` : ""}
            ${sig.showWebsite && sig.website ? `<tr><td style="padding: 2px 0;"><span style="${fontBase} font-size: ${sig.fontSize}px;">🌐 <a href="https://${sig.website.replace(/^https?:\/\//, "")}" target="_blank" style="color: ${sig.primaryColor}; text-decoration: none;">${sig.website}</a></span></td></tr>` : ""}
            ${sig.showAddress && sig.address ? `<tr><td style="padding: 2px 0;"><span style="${fontBase} font-size: ${sig.fontSize}px;">📍 ${sig.address}</span></td></tr>` : ""}
            ${sig.showSchedulingLink && sig.schedulingLink ? `<tr><td style="padding: 4px 0;"><a href="${sig.schedulingLink}" target="_blank" style="display: inline-block; padding: 4px 12px; background: ${sig.primaryColor}; color: #fff; text-decoration: none; border-radius: 4px; font-size: ${sig.fontSize - 1}px; font-weight: 600;">📅 Schedule a Meeting</a></td></tr>` : ""}
          </table>
          ${sig.showSocialIcons && socialLinks ? `<div style="margin-top: 10px;">${socialLinks}</div>` : ""}
          ${sig.showCta && sig.cta && sig.ctaUrl ? `<div style="margin-top: 10px;"><a href="${sig.ctaUrl}" target="_blank" style="display: inline-block; padding: 8px 18px; background: linear-gradient(135deg, ${sig.primaryColor}, ${sig.secondaryColor}); color: #fff; text-decoration: none; border-radius: 6px; font-size: ${sig.fontSize}px; font-weight: 700;">${sig.cta}</a></div>` : ""}
          ${sig.showDisclaimer && sig.disclaimer ? `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb;"><p style="margin: 0; font-size: ${sig.fontSize - 2}px; color: #9ca3af; line-height: 1.4;">${sig.disclaimer}</p></div>` : ""}
        </td>
      </tr>
    </table>
  `;

  const logoBlock = sig.showLogo && sig.logoUrl
    ? `<tr><td style="padding-bottom: 10px;"><img src="${sig.logoUrl}" alt="${sig.company} logo" width="${sig.logoWidth}" style="width: ${sig.logoWidth}px; display: block;" /></td></tr>`
    : "";

  if (isHorizontal) {
    return `
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: ${sig.fontFamily}; background-color: ${sig.bgColor}; padding: 16px;">
  ${logoBlock}
  <tr>
    ${photoBlock}
    <td style="vertical-align: top;">
      ${mainInfo}
    </td>
  </tr>
  ${sig.showCustomHtml && sig.customHtml ? `<tr><td colspan="2" style="padding-top: 12px;">${sig.customHtml}</td></tr>` : ""}
</table>`;
  } else {
    return `
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-family: ${sig.fontFamily}; background-color: ${sig.bgColor}; padding: 16px;">
  ${sig.showPhoto && sig.photoUrl ? `<tr><td style="padding-bottom: 12px; text-align: center;"><img src="${sig.photoUrl}" alt="${sig.name}" width="${sig.photoSize}" height="${sig.photoSize}" style="width: ${sig.photoSize}px; height: ${sig.photoSize}px; border-radius: ${sig.photoShape === "circle" ? "50%" : sig.photoShape === "rounded" ? "12px" : "0"}; object-fit: cover; display: block; margin: 0 auto;" /></td></tr>` : ""}
  ${logoBlock}
  <tr><td style="vertical-align: top;">${mainInfo}</td></tr>
  ${sig.showCustomHtml && sig.customHtml ? `<tr><td style="padding-top: 12px;">${sig.customHtml}</td></tr>` : ""}
</table>`;
  }
}

function getSocialSvg(key, color, size) {
  const s = size || 16;
  const svgs = {
    linkedin: `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    twitter: `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    facebook: `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    instagram: `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    github: `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
    youtube: `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>`,
  };
  return svgs[key] || "";
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2 font-semibold text-sm text-gray-800 dark:text-gray-100">
          {Icon && <Icon size={15} className="text-brandColor" />}
          {title}
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 py-4 space-y-3 bg-white dark:bg-gray-900/40">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", hint }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brandColor focus:ring-1 focus:ring-brandColor/30 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
    />
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const ToggleField = ({ label, value, onChange, hint }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? "bg-brandColor" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-5" : ""}`} />
    </button>
  </div>
);

const ColorField = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 px-2 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brandColor text-gray-900 dark:text-gray-100"
      />
    </div>
  </div>
);

const SliderField = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <span className="text-xs font-mono text-brandColor font-semibold">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full accent-brandColor cursor-pointer"
    />
    <div className="flex justify-between text-xs text-gray-400">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brandColor transition-all text-gray-900 dark:text-gray-100 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function EmailSignatureEditor() {
  const [sig, setSig] = useState(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState("editor");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [activeSection, setActiveSection] = useState("guidelines");
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const update = useCallback((key, value) => {
    setSig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSocial = useCallback((key, value) => {
    setSig((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }, []);

  const signatureHTML = generateSignatureHTML(sig);

  const copyHTML = async () => {
    try {
      await navigator.clipboard.writeText(signatureHTML);
      setCopiedHtml(true);
      toast.success("HTML copied to clipboard!");
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      toast.error("Failed to copy HTML");
    }
  };

  const copySignature = async () => {
    try {
      const blob = new Blob([signatureHTML], { type: "text/html" });
      const item = new ClipboardItem({ "text/html": blob, "text/plain": new Blob([signatureHTML], { type: "text/plain" }) });
      await navigator.clipboard.write([item]);
      setCopied(true);
      toast.success("Signature copied! Paste it in your email client.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      try {
        await navigator.clipboard.writeText(signatureHTML);
        setCopied(true);
        toast.success("Signature HTML copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Copy failed. Try copying the HTML code manually.");
      }
    }
  };

  const downloadHTML = () => {
    const fullHtml = `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>Email Signature</title></head>\n<body style="padding: 20px; background: #f5f5f5;">\n${signatureHTML}\n</body>\n</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sig.name.replace(/\s+/g, "-").toLowerCase()}-signature.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Signature HTML downloaded!");
  };

  const resetSignature = () => {
    setSig(DEFAULT_STATE);
    toast.info("Signature reset to default.");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image too large. Max 2MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => update("photoUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo too large. Max 2MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => update("logoUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const applyTemplate = (templateId) => {
    const templates = {
      professional: { primaryColor: "#1a365d", secondaryColor: "#2b6cb0", textColor: "#2d3748", dividerColor: "#2b6cb0", fontFamily: "Georgia, 'Times New Roman', serif" },
      modern: { primaryColor: "#7c00fe", secondaryColor: "#4635b1", textColor: "#1a1a2e", dividerColor: "#7c00fe", fontFamily: "Arial, Helvetica, sans-serif" },
      minimal: { primaryColor: "#374151", secondaryColor: "#6b7280", textColor: "#374151", dividerColor: "#d1d5db", fontFamily: "Arial, Helvetica, sans-serif", dividerStyle: "dotted" },
      creative: { primaryColor: "#f59e0b", secondaryColor: "#ef4444", textColor: "#1f2937", dividerColor: "#f59e0b", fontFamily: "Trebuchet MS, Helvetica, sans-serif" },
      corporate: { primaryColor: "#0f172a", secondaryColor: "#334155", textColor: "#1e293b", dividerColor: "#0f172a", fontFamily: "Verdana, Geneva, Tahoma, sans-serif" },
    };
    const t = templates[templateId];
    if (t) setSig((prev) => ({ ...prev, template: templateId, ...t }));
    toast.success(`"${TEMPLATES.find(t => t.id === templateId)?.label}" template applied!`);
  };

  const tabs = [
    { id: "editor", label: "Editor", icon: Type },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "code", label: "HTML Code", icon: FileCode },
    { id: "info", label: "Guide & Info", icon: Info },
  ];

  return (
    <ToolPageShell widthClassName="max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brandColor/10 flex items-center justify-center">
            <Mail size={20} className="text-brandColor" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Email Signature Editor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create professional, customizable email signatures in seconds</p>
          </div>
        </div>

        {/* Template Picker */}
        <div className="flex flex-wrap gap-2 mt-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sig.template === t.id ? "bg-brandColor text-white border-brandColor shadow-md" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brandColor hover:text-brandColor"}`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── EDITOR TAB ── */}
      <AnimatePresence mode="wait">
        {activeTab === "editor" && (
          <motion.div key="editor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
              {/* Left: Controls */}
              <div className="space-y-1">
                {/* Personal Information */}
                <Section title="Personal Information" icon={User}>
                  <div className="grid grid-cols-1 gap-3">
                    <InputField label="Full Name *" icon={User} value={sig.name} onChange={(v) => update("name", v)} placeholder="Alex Johnson" />
                    <InputField label="Job Title *" icon={Briefcase} value={sig.jobTitle} onChange={(v) => update("jobTitle", v)} placeholder="Senior Product Designer" />
                    <InputField label="Department" icon={Building2} value={sig.department} onChange={(v) => update("department", v)} placeholder="Design & Innovation" />
                    <InputField label="Company *" icon={Building2} value={sig.company} onChange={(v) => update("company", v)} placeholder="Nexus Creative Studio" />
                    <InputField label="Pronouns" icon={User} value={sig.pronouns} onChange={(v) => update("pronouns", v)} placeholder="he/him, she/her, they/them" />
                  </div>
                </Section>

                {/* Contact Details */}
                <Section title="Contact Details" icon={Phone}>
                  <div className="grid grid-cols-1 gap-3">
                    <InputField label="Email Address *" icon={Mail} value={sig.email} onChange={(v) => update("email", v)} placeholder="alex@company.com" type="email" />
                    <InputField label="Phone Number" icon={Phone} value={sig.phone} onChange={(v) => update("phone", v)} placeholder="+1 (555) 890-1234" />
                    <InputField label="Mobile Number" icon={Smartphone} value={sig.mobile} onChange={(v) => update("mobile", v)} placeholder="+1 (555) 567-8901" />
                    <InputField label="Website" icon={Globe} value={sig.website} onChange={(v) => update("website", v)} placeholder="www.company.com" />
                    <InputField label="Address" icon={MapPin} value={sig.address} onChange={(v) => update("address", v)} placeholder="123 Main St, City, State ZIP" />
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Show / Hide Fields</p>
                    <ToggleField label="Show Email" value={sig.showEmail} onChange={(v) => update("showEmail", v)} />
                    <ToggleField label="Show Phone" value={sig.showPhone} onChange={(v) => update("showPhone", v)} />
                    <ToggleField label="Show Mobile" value={sig.showMobile} onChange={(v) => update("showMobile", v)} />
                    <ToggleField label="Show Website" value={sig.showWebsite} onChange={(v) => update("showWebsite", v)} />
                    <ToggleField label="Show Address" value={sig.showAddress} onChange={(v) => update("showAddress", v)} />
                    <ToggleField label="Show Department" value={sig.showDepartment} onChange={(v) => update("showDepartment", v)} />
                    <ToggleField label="Show Pronouns" value={sig.showPronouns} onChange={(v) => update("showPronouns", v)} />
                  </div>
                </Section>

                {/* Social Media */}
                <Section title="Social Media Links" icon={Share2}>
                  <div className="space-y-3">
                    {SOCIAL_PLATFORMS.map((p) => (
                      <div key={p.key} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.color + "20" }}>
                          <p.Icon size={14} style={{ color: p.color }} />
                        </div>
                        <input
                          value={sig.social[p.key]}
                          onChange={(e) => updateSocial(p.key, e.target.value)}
                          placeholder={p.placeholder}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brandColor transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                        />
                      </div>
                    ))}
                    <ToggleField label="Show Social Icons" value={sig.showSocialIcons} onChange={(v) => update("showSocialIcons", v)} />
                    <ToggleField label="Use Brand Colors for Icons" value={sig.showSocialColors} onChange={(v) => update("showSocialColors", v)} />
                    <SelectField
                      label="Icon Style"
                      value={sig.socialIconStyle}
                      onChange={(v) => update("socialIconStyle", v)}
                      options={[{ value: "circle", label: "Circle Background" }, { value: "square", label: "Square Background" }, { value: "plain", label: "Plain (No Background)" }]}
                    />
                    <SliderField label="Icon Size" value={sig.socialIconSize} onChange={(v) => update("socialIconSize", v)} min={16} max={36} unit="px" />
                  </div>
                </Section>

                {/* Photo & Logo */}
                <Section title="Photo & Logo" icon={Image}>
                  <div className="space-y-3">
                    <ToggleField label="Show Profile Photo" value={sig.showPhoto} onChange={(v) => update("showPhoto", v)} />
                    {sig.showPhoto && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1.5">Upload Photo</label>
                          <div className="flex items-center gap-3">
                            {sig.photoUrl && (
                              <div className="relative">
                                <img src={sig.photoUrl} alt="preview" className="w-12 h-12 rounded-full object-cover border-2 border-brandColor/30" />
                                <button onClick={() => update("photoUrl", "")} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><X size={10} /></button>
                              </div>
                            )}
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-200 hover:border-brandColor transition-all">
                              <Upload size={12} /> Upload Image
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </div>
                        </div>
                        <InputField label="Or Photo URL" icon={Link} value={sig.photoUrl} onChange={(v) => update("photoUrl", v)} placeholder="https://example.com/photo.jpg" />
                        <SelectField label="Photo Shape" value={sig.photoShape} onChange={(v) => update("photoShape", v)} options={[{ value: "circle", label: "Circle" }, { value: "rounded", label: "Rounded" }, { value: "square", label: "Square" }]} />
                        <SliderField label="Photo Size" value={sig.photoSize} onChange={(v) => update("photoSize", v)} min={40} max={120} unit="px" />
                      </>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                      <ToggleField label="Show Company Logo" value={sig.showLogo} onChange={(v) => update("showLogo", v)} />
                      {sig.showLogo && (
                        <>
                          <div className="mt-2 flex items-center gap-3">
                            {sig.logoUrl && (
                              <div className="relative">
                                <img src={sig.logoUrl} alt="logo" className="h-8 object-contain border border-gray-200 dark:border-gray-600 rounded" />
                                <button onClick={() => update("logoUrl", "")} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><X size={10} /></button>
                              </div>
                            )}
                            <button onClick={() => logoInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-200 hover:border-brandColor transition-all">
                              <Upload size={12} /> Upload Logo
                            </button>
                            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </div>
                          <div className="mt-2">
                            <InputField label="Or Logo URL" icon={Link} value={sig.logoUrl} onChange={(v) => update("logoUrl", v)} placeholder="https://example.com/logo.png" />
                            <div className="mt-2">
                              <SliderField label="Logo Width" value={sig.logoWidth} onChange={(v) => update("logoWidth", v)} min={60} max={250} unit="px" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Section>

                {/* Design & Colors */}
                <Section title="Design & Colors" icon={Palette}>
                  <div className="space-y-3">
                    <ColorField label="Primary Color" value={sig.primaryColor} onChange={(v) => update("primaryColor", v)} />
                    <ColorField label="Secondary Color" value={sig.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
                    <ColorField label="Text Color" value={sig.textColor} onChange={(v) => update("textColor", v)} />
                    <ColorField label="Background Color" value={sig.bgColor} onChange={(v) => update("bgColor", v)} />
                    <SelectField label="Font Family" value={sig.fontFamily} onChange={(v) => update("fontFamily", v)} options={FONT_FAMILIES.map(f => ({ value: f.value, label: f.label }))} />
                    <SliderField label={`Font Size (Desktop, min 14px)`} value={sig.fontSize} onChange={(v) => update("fontSize", Math.max(14, v))} min={14} max={22} unit="px" />
                    <SliderField label={`Font Size (Mobile, min 12px)`} value={sig.mobileFontSize} onChange={(v) => update("mobileFontSize", Math.max(12, v))} min={12} max={18} unit="px" />
                    <SliderField label="Name Size" value={sig.nameSize} onChange={(v) => update("nameSize", v)} min={16} max={36} unit="px" />
                    <SliderField label="Job Title Size" value={sig.jobTitleSize} onChange={(v) => update("jobTitleSize", v)} min={12} max={24} unit="px" />
                    <SliderField label="Line Height" value={sig.lineHeight} onChange={(v) => update("lineHeight", v)} min={1.2} max={2.2} step={0.1} />
                    <SelectField label="Name Style" value={sig.nameStyle} onChange={(v) => update("nameStyle", v)} options={[{ value: "bold", label: "Bold" }, { value: "italic", label: "Italic" }, { value: "normal", label: "Normal" }]} />
                    <SelectField label="Job Title Style" value={sig.jobTitleStyle} onChange={(v) => update("jobTitleStyle", v)} options={[{ value: "normal", label: "Normal" }, { value: "bold", label: "Bold" }, { value: "italic", label: "Italic" }]} />
                  </div>
                </Section>

                {/* Layout */}
                <Section title="Layout & Structure" icon={Layout}>
                  <div className="space-y-3">
                    <SelectField label="Layout Direction" value={sig.layoutDirection} onChange={(v) => update("layoutDirection", v)} options={[{ value: "horizontal", label: "Horizontal (Photo Left)" }, { value: "vertical", label: "Vertical (Photo Top)" }]} />
                    <ToggleField label="Show Divider Line" value={sig.showDivider} onChange={(v) => update("showDivider", v)} />
                    {sig.showDivider && (
                      <>
                        <ColorField label="Divider Color" value={sig.dividerColor} onChange={(v) => update("dividerColor", v)} />
                        <SliderField label="Divider Width" value={sig.dividerWidth} onChange={(v) => update("dividerWidth", v)} min={1} max={8} unit="px" />
                        <SelectField label="Divider Style" value={sig.dividerStyle} onChange={(v) => update("dividerStyle", v)} options={DIVIDER_STYLES} />
                      </>
                    )}
                  </div>
                </Section>

                {/* Advanced Options Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${showAdvanced ? "border-brandColor bg-brandColor/5 text-brandColor" : "border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brandColor hover:text-brandColor"}`}
                >
                  <div className="flex items-center gap-2">
                    <Settings size={15} />
                    Advanced Options
                    {showAdvanced && <span className="px-1.5 py-0.5 bg-brandColor text-white text-xs rounded-full">Active</span>}
                  </div>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="space-y-1 pt-1 border-l-2 border-brandColor/30 pl-2">
                        {/* CTA Button */}
                        <Section title="Call-to-Action Button" icon={Zap} defaultOpen={false}>
                          <ToggleField label="Show CTA Button" value={sig.showCta} onChange={(v) => update("showCta", v)} />
                          {sig.showCta && (
                            <>
                              <InputField label="Button Text" value={sig.cta} onChange={(v) => update("cta", v)} placeholder="Book a Free Consultation" />
                              <InputField label="Button URL" icon={Link} value={sig.ctaUrl} onChange={(v) => update("ctaUrl", v)} placeholder="https://calendly.com/yourlink" />
                            </>
                          )}
                        </Section>

                        {/* Scheduling Link */}
                        <Section title="Meeting Scheduler Link" icon={Star} defaultOpen={false}>
                          <ToggleField label="Show Scheduling Link" value={sig.showSchedulingLink} onChange={(v) => update("showSchedulingLink", v)} />
                          {sig.showSchedulingLink && (
                            <InputField label="Calendly / Cal.com URL" icon={Link} value={sig.schedulingLink} onChange={(v) => update("schedulingLink", v)} placeholder="https://calendly.com/yourlink" />
                          )}
                        </Section>

                        {/* Disclaimer */}
                        <Section title="Legal Disclaimer" icon={Shield} defaultOpen={false}>
                          <ToggleField label="Show Disclaimer" value={sig.showDisclaimer} onChange={(v) => update("showDisclaimer", v)} />
                          {sig.showDisclaimer && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Disclaimer Text</label>
                              <textarea
                                value={sig.disclaimer}
                                onChange={(e) => update("disclaimer", e.target.value)}
                                placeholder="This email and any attachments are confidential..."
                                rows={3}
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brandColor transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
                              />
                            </div>
                          )}
                        </Section>

                        {/* Eco / Green Badge */}
                        <Section title="Green / Eco Badge" icon={CheckCircle} defaultOpen={false}>
                          <ToggleField
                            label="Show Eco-Friendly Badge"
                            value={sig.greenBadge}
                            onChange={(v) => update("greenBadge", v)}
                            hint="Adds a 'Think before you print' eco reminder"
                          />
                        </Section>

                        {/* Custom HTML */}
                        <Section title="Custom HTML Injection" icon={FileCode} defaultOpen={false}>
                          <ToggleField label="Enable Custom HTML" value={sig.showCustomHtml} onChange={(v) => update("showCustomHtml", v)} hint="Advanced: inject raw HTML at the bottom of your signature" />
                          {sig.showCustomHtml && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Custom HTML</label>
                              <textarea
                                value={sig.customHtml}
                                onChange={(e) => update("customHtml", e.target.value)}
                                placeholder='<p style="color: green;">🌱 Think before you print.</p>'
                                rows={5}
                                className="w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brandColor transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y"
                              />
                            </div>
                          )}
                        </Section>

                        {/* Email Subject */}
                        <Section title="Email Subject Template" icon={Mail} defaultOpen={false}>
                          <InputField
                            label="Default Subject Template"
                            icon={Mail}
                            value={sig.emailSubjectTemplate}
                            onChange={(v) => update("emailSubjectTemplate", v)}
                            placeholder="[Company Name] - Re: {topic}"
                            hint="Template for automated email subjects (informational)"
                          />
                        </Section>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetSignature}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-500 transition-all"
                  >
                    <RefreshCw size={13} /> Reset
                  </button>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="space-y-4">
                <div className="sticky top-24">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all ${previewDevice === "desktop" ? "bg-brandColor text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}
                      >
                        <Monitor size={13} /> Desktop
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all ${previewDevice === "mobile" ? "bg-brandColor text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}
                      >
                        <Smartphone size={13} /> Mobile
                      </button>
                    </div>
                  </div>

                  {/* Email client mockup */}
                  <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-xl ${previewDevice === "mobile" ? "max-w-sm mx-auto" : ""}`}>
                    {/* Email client header bar */}
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="flex-1 mx-4 bg-white dark:bg-gray-700 rounded px-3 py-1 text-xs text-gray-500 dark:text-gray-400">Email Client Preview</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        <div><span className="font-medium text-gray-700 dark:text-gray-300">From:</span> {sig.name} &lt;{sig.email}&gt;</div>
                        <div><span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span> Re: Project Update</div>
                      </div>
                    </div>

                    {/* Email body */}
                    <div className="p-5">
                      <p className={`text-gray-700 dark:text-gray-300 mb-5 ${previewDevice === "mobile" ? "text-xs" : "text-sm"}`}>
                        Hi there,<br /><br />
                        Thank you for reaching out. I'll get back to you as soon as possible.<br /><br />
                        Best regards,
                      </p>

                      {/* Signature area */}
                      <div
                        ref={previewRef}
                        className="border-t border-gray-200 dark:border-gray-700 pt-4"
                        style={{ fontSize: previewDevice === "mobile" ? `${sig.mobileFontSize}px` : `${sig.fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: signatureHTML }}
                      />
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={copySignature}
                      className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-semibold transition-all shadow-sm ${copied ? "bg-green-500 text-white" : "bg-brandColor text-white hover:bg-brandColor/90 active:scale-95"}`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Copied!" : "Copy Signature"}
                    </button>
                    <button
                      onClick={copyHTML}
                      className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-semibold transition-all shadow-sm ${copiedHtml ? "bg-green-500 text-white" : "bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 active:scale-95"}`}
                    >
                      {copiedHtml ? <Check size={16} /> : <FileCode size={16} />}
                      {copiedHtml ? "Copied!" : "Copy HTML"}
                    </button>
                    <button
                      onClick={downloadHTML}
                      className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-brandColor hover:text-brandColor transition-all shadow-sm"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>

                  {/* Installation Tip */}
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">💡 How to install this signature</p>
                    <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5 list-decimal list-inside">
                      <li>Click "Copy Signature" above</li>
                      <li>Open Gmail → Settings → Signature</li>
                      <li>Create new signature and paste (Ctrl+V)</li>
                      <li>Save changes and you're done!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PREVIEW TAB ── */}
        {activeTab === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Signature Preview</h2>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewDevice("desktop")} className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all ${previewDevice === "desktop" ? "bg-brandColor text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}><Monitor size={15} /> Desktop</button>
                  <button onClick={() => setPreviewDevice("mobile")} className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all ${previewDevice === "mobile" ? "bg-brandColor text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}><Smartphone size={15} /> Mobile</button>
                </div>
              </div>

              <div className={`mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-2xl ${previewDevice === "mobile" ? "max-w-sm" : "max-w-3xl"}`}>
                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex gap-2"><span className="font-semibold text-gray-500 w-16">From:</span><span className="text-gray-700 dark:text-gray-300">{sig.name} &lt;{sig.email}&gt;</span></div>
                    <div className="flex gap-2"><span className="font-semibold text-gray-500 w-16">To:</span><span className="text-gray-700 dark:text-gray-300">team@client.com</span></div>
                    <div className="flex gap-2"><span className="font-semibold text-gray-500 w-16">Subject:</span><span className="text-gray-700 dark:text-gray-300">Project Update — Q3 Review</span></div>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed" style={{ fontSize: previewDevice === "mobile" ? "12px" : "14px" }}>
                    <p>Hi Sarah,</p>
                    <br />
                    <p>I hope this message finds you well. I wanted to follow up on our discussion regarding the Q3 product roadmap. I've attached the updated deck for your review — please let me know if you have any feedback before Thursday's call.</p>
                    <br />
                    <p>Looking forward to connecting!</p>
                    <br />
                    <p>Best regards,</p>
                  </div>
                  <div
                    className="border-t border-gray-200 dark:border-gray-700 pt-5"
                    style={{ fontSize: previewDevice === "mobile" ? `${sig.mobileFontSize}px` : `${sig.fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: signatureHTML }}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={copySignature} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${copied ? "bg-green-500 text-white" : "bg-brandColor text-white hover:bg-brandColor/90 active:scale-95"}`}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Signature Copied!" : "Copy Signature"}
                </button>
                <button onClick={downloadHTML} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-brandColor hover:text-brandColor transition-all shadow-sm">
                  <Download size={16} /> Download HTML
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── HTML CODE TAB ── */}
        {activeTab === "code" && (
          <motion.div key="code" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">HTML Source Code</h2>
                <div className="flex gap-2">
                  <button onClick={copyHTML} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-semibold transition-all ${copiedHtml ? "bg-green-500 text-white" : "bg-brandColor text-white hover:bg-brandColor/90"}`}>
                    {copiedHtml ? <Check size={14} /> : <Copy size={14} />}
                    {copiedHtml ? "Copied!" : "Copy HTML"}
                  </button>
                  <button onClick={downloadHTML} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 transition-all">
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
              <div className="relative">
                <pre className="bg-gray-950 text-green-400 text-xs rounded-2xl p-5 overflow-auto max-h-[70vh] leading-relaxed border border-gray-800 scrollbar-thin">
                  <code>{signatureHTML}</code>
                </pre>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2">📋 Gmail Setup</h3>
                  <ol className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-decimal list-inside">
                    <li>Copy the HTML above</li>
                    <li>Open Gmail → Settings (⚙) → See all settings</li>
                    <li>Scroll to "Signature" section</li>
                    <li>Click "+ Create new"</li>
                    <li>In the editor, click the {"<>"} button (or use keyboard shortcut)</li>
                    <li>Paste the HTML code</li>
                    <li>Save Changes</li>
                  </ol>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">📋 Outlook Setup</h3>
                  <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Download the HTML file above</li>
                    <li>Open Outlook → File → Options → Mail</li>
                    <li>Click "Signatures..."</li>
                    <li>Click "New" and name your signature</li>
                    <li>Open the downloaded HTML in a browser</li>
                    <li>Select all (Ctrl+A), copy, paste into Outlook editor</li>
                    <li>Click OK to save</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── GUIDE & INFO TAB ── */}
        {activeTab === "info" && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="space-y-6">
              {/* Sub-nav */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: "guidelines", label: "📏 Guidelines" },
                  { id: "bestpractices", label: "✅ Best Practices" },
                  { id: "tips", label: "💡 Pro Tips" },
                  { id: "platforms", label: "📧 Platform Guides" },
                  { id: "faq", label: "❓ FAQ" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeSection === s.id ? "bg-brandColor text-white shadow" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-brandColor"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "guidelines" && (
                  <motion.div key="guidelines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard icon="📐" title="Size Guidelines" color="blue">
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span><strong>Max width:</strong> 600–700px (email safe)</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span><strong>Profile photo:</strong> 80–100px recommended</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span><strong>Logo width:</strong> 100–150px recommended</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span><strong>Total signature height:</strong> Keep under 150px for most clients</span></li>
                          <li className="flex gap-2"><AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" /><span><strong>Mobile minimum font:</strong> 12px (required for readability)</span></li>
                          <li className="flex gap-2"><AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" /><span><strong>Desktop minimum font:</strong> 14px (accessibility standard)</span></li>
                        </ul>
                      </InfoCard>
                      <InfoCard icon="🎨" title="Color Guidelines" color="purple">
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Use <strong>2–3 colors maximum</strong> for a clean look</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Ensure <strong>4.5:1 contrast ratio</strong> for accessibility</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Use your <strong>brand colors</strong> for consistency</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>White or light backgrounds work best</span></li>
                          <li className="flex gap-2"><AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" /><span>Avoid bright neon colors — unprofessional</span></li>
                          <li className="flex gap-2"><AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" /><span>Dark backgrounds may not render in all clients</span></li>
                        </ul>
                      </InfoCard>
                      <InfoCard icon="✏️" title="Typography Guidelines" color="green">
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Use <strong>web-safe fonts</strong>: Arial, Georgia, Verdana, Trebuchet MS</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Name: <strong>18–22px bold</strong> for good visual hierarchy</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Job title: <strong>13–15px</strong>, normal or italic weight</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Contact info: <strong>12–14px</strong> regular weight</span></li>
                          <li className="flex gap-2"><AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" /><span>Avoid custom/Google Fonts — won't render in most email clients</span></li>
                        </ul>
                      </InfoCard>
                      <InfoCard icon="📱" title="Mobile Compatibility" color="orange">
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Minimum <strong>12px font size</strong> on mobile (enforced)</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Use <strong>table-based layouts</strong> for compatibility</span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Ensure <strong>touch-friendly link spacing</strong></span></li>
                          <li className="flex gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>Test in both Gmail and Apple Mail on iPhone</span></li>
                          <li className="flex gap-2"><AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" /><span>Avoid CSS flexbox — use tables for email</span></li>
                        </ul>
                      </InfoCard>
                    </div>
                  </motion.div>
                )}

                {activeSection === "bestpractices" && (
                  <motion.div key="bestpractices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: "✅", title: "Keep it Concise", desc: "Limit your signature to 4–6 lines of contact info. More information causes visual overwhelm and reduces readability.", color: "green" },
                        { icon: "🔗", title: "Use Live Links", desc: "Always hyperlink your email, phone number (tel:), website, and social profiles. Makes it easy to tap on mobile.", color: "blue" },
                        { icon: "🖼️", title: "Optimize Images", desc: "Use images under 100KB. Host images externally — don't embed them as base64 as many email clients block them.", color: "purple" },
                        { icon: "🌐", title: "Test Across Clients", desc: "Test your signature in Gmail, Outlook, Apple Mail, and Thunderbird. Rendering varies significantly between clients.", color: "orange" },
                        { icon: "⚖️", title: "Legal Compliance", desc: "Add a legal disclaimer if required by your company or jurisdiction. GDPR and CCPA may require disclosures.", color: "red" },
                        { icon: "♿", title: "Accessibility", desc: "Use alt text on images. Maintain sufficient color contrast. Never use color alone to convey information.", color: "teal" },
                        { icon: "📊", title: "Track Performance", desc: "Add UTM parameters to website links to track email signature traffic in Google Analytics.", color: "indigo" },
                        { icon: "🔄", title: "Update Regularly", desc: "Review your signature quarterly. Update title, contact, and social links as things change.", color: "cyan" },
                        { icon: "🏢", title: "Brand Consistency", desc: "Use your company's brand colors, font style, and logo to maintain professional consistency across the team.", color: "pink" },
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow">
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === "tips" && (
                  <motion.div key="tips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="space-y-4">
                      {[
                        { tip: "Use a scheduling link (Calendly, Cal.com) to make booking meetings effortless. Add it as a CTA button.", level: "Pro", color: "purple" },
                        { tip: "Add your LinkedIn profile — recruiters and potential clients often check it immediately after receiving an email.", level: "Essential", color: "blue" },
                        { tip: "A professional headshot increases trust and recognition by 30%+ compared to a no-photo signature.", level: "Pro", color: "purple" },
                        { tip: "Use a gradient divider that matches your brand to make your signature visually distinctive.", level: "Design", color: "pink" },
                        { tip: "Avoid adding quotes or inspirational text — it comes across as unprofessional in business settings.", level: "Warning", color: "red" },
                        { tip: "Use 'tel:' links for phone numbers so mobile users can tap to call instantly.", level: "Essential", color: "blue" },
                        { tip: "Don't add emoji to your name or job title — it can render incorrectly in some email clients.", level: "Warning", color: "red" },
                        { tip: "If your company uses Office 365, consider server-side signature management tools like Exclaimer.", level: "Advanced", color: "gray" },
                        { tip: "Add a 'mailto:' link to your email address with a pre-filled subject line for faster responses.", level: "Pro", color: "purple" },
                        { tip: "For international business, add your country code to phone numbers to avoid confusion.", level: "Essential", color: "blue" },
                        { tip: "Add UTM parameters to website and social links to track traffic in analytics: ?utm_source=email_signature", level: "Advanced", color: "gray" },
                        { tip: "Keep your signature under 70KB total (including images). Large signatures may be blocked by spam filters.", level: "Technical", color: "orange" },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow">
                          <div className={`px-2 py-0.5 h-fit rounded text-xs font-bold flex-shrink-0 ${item.color === "purple" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : item.color === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : item.color === "red" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : item.color === "pink" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" : item.color === "orange" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>{item.level}</div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.tip}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === "platforms" && (
                  <motion.div key="platforms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          name: "Gmail", icon: "📧", steps: [
                            "Open Gmail and click ⚙ Settings",
                            "Click 'See all settings'",
                            "Scroll to 'Signature' section",
                            "Click '+ Create new' and name it",
                            'Click the "<>" icon in the editor toolbar',
                            "Paste the HTML code",
                            "Set as default for 'New emails' and 'Replies'",
                            "Scroll down and click 'Save Changes'",
                          ]
                        },
                        {
                          name: "Outlook (Desktop)", icon: "📮", steps: [
                            "Open Outlook and go to File → Options",
                            "Click on 'Mail' then 'Signatures...'",
                            "Click 'New' and name your signature",
                            "Download the .html file from our tool",
                            "Open the .html file in a browser",
                            "Select all (Ctrl+A), copy (Ctrl+C)",
                            "Click in the Outlook signature editor",
                            "Paste (Ctrl+V) and click OK",
                          ]
                        },
                        {
                          name: "Apple Mail", icon: "🍎", steps: [
                            "Open Mail → Preferences (or Settings on macOS)",
                            "Click on the 'Signatures' tab",
                            "Select your email account on the left",
                            "Click the '+' button to add a new signature",
                            "In a text editor, open the .html file",
                            "Copy all content (Ctrl/Cmd+A, then C)",
                            "Close preferences, quit Mail",
                            "Paste into ~/.Library/Mail/Signatures/*.mailsignature",
                          ]
                        },
                        {
                          name: "Thunderbird", icon: "🦅", steps: [
                            "Open Thunderbird Account Settings",
                            "Select your account from the list",
                            "Check 'Use HTML' checkbox",
                            "Paste the HTML directly into the text area",
                            "Or: Save as .html and set as signature file",
                            "Go to: Account Settings → Signature text",
                            "Check 'Attach the signature from a file'",
                            "Browse and select your .html file",
                          ]
                        },
                        {
                          name: "Office 365 / Outlook Web", icon: "☁️", steps: [
                            "Go to outlook.office.com and sign in",
                            "Click ⚙ Settings → View all Outlook settings",
                            "Go to Mail → Compose and reply",
                            "Under 'Email signature', click in the editor",
                            "Click the '</>' (HTML) icon in toolbar",
                            "Paste your HTML code",
                            "Set as default for new emails and replies",
                            "Click 'Save' at the top",
                          ]
                        },
                        {
                          name: "Yahoo Mail", icon: "📬", steps: [
                            "Open Yahoo Mail settings (⚙ icon)",
                            "Click 'More Settings'",
                            "Click 'Writing email' in the left menu",
                            "Under 'Signature', toggle it on",
                            "Click the editor and switch to HTML if available",
                            "Paste the HTML code",
                            "Save changes",
                            "Send a test email to verify rendering",
                          ]
                        },
                      ].map((platform) => (
                        <div key={platform.name} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                            <span className="text-lg">{platform.icon}</span> {platform.name}
                          </h3>
                          <ol className="space-y-1.5">
                            {platform.steps.map((step, i) => (
                              <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <span className="w-4 h-4 rounded-full bg-brandColor/10 text-brandColor flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSection === "faq" && (
                  <motion.div key="faq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="space-y-3">
                      {[
                        { q: "Why does my signature look different in Outlook vs Gmail?", a: "Email clients render HTML very differently. Outlook uses Microsoft Word's rendering engine, which has limited CSS support. Gmail is more modern but strips some styles. This is why we use table-based layouts which work universally across all clients." },
                        { q: "Why aren't my custom fonts showing up?", a: "Email clients don't support custom/Google Fonts. We only use web-safe fonts (Arial, Georgia, Verdana, etc.) that are guaranteed to render on all devices and operating systems. Custom fonts must be declared with multiple fallbacks." },
                        { q: "How do I prevent images from showing as attachments?", a: "Host your images on a publicly accessible server (e.g., your company CDN or an image hosting service). Don't embed images as base64 data URIs — some email clients will block them or show them as attachments." },
                        { q: "What's the recommended image format for signatures?", a: "Use PNG for logos and icons (supports transparency). Use JPEG for profile photos. Keep total image file sizes under 100KB each. Serve images over HTTPS to prevent security warnings in Outlook." },
                        { q: "Can I use emojis in my email signature?", a: "Emojis can be used in contact info fields (e.g., 📞 for phone) as they render well in most modern email clients. However, avoid emojis in your name or job title as they may not render correctly in all clients, especially older Outlook versions." },
                        { q: "My signature is being marked as spam. Why?", a: "Large signatures, images served over HTTP, too many links, or certain keywords can trigger spam filters. Keep your signature concise (under 70KB), use HTTPS for all links, and don't include shortened URLs (bit.ly, etc.)." },
                        { q: "How do I add my signature to multiple team members?", a: "The best approach for teams is to use an email signature management tool like Exclaimer, Crossware, or CodeTwo for Outlook/Office 365. These apply server-side signatures centrally. For small teams, share the HTML file and have each member paste it into their client." },
                        { q: "Does the signature work on mobile devices?", a: "Yes! We enforce minimum font sizes (12px mobile, 14px desktop) and use table-based layouts that scale correctly. We recommend testing on both an iPhone (Apple Mail, Gmail) and an Android device to ensure proper rendering." },
                        { q: "How do I remove the old signature and replace it?", a: "In Gmail: Settings → Signatures → find your old signature → delete or overwrite it. In Outlook: File → Options → Mail → Signatures → select the old one → delete or overwrite. Then follow the setup instructions for your client." },
                        { q: "Is my data stored anywhere?", a: "No! This tool is 100% client-side. All signature data is processed in your browser. Nothing is sent to our servers. Your personal information, photos, and company details stay completely private on your device." },
                      ].map((item, i) => (
                        <FAQItem key={i} q={item.q} a={item.a} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageShell>
  );
}

// ─────────────────────────────────────────────────────────
// Info Card Component
// ─────────────────────────────────────────────────────────
function InfoCard({ icon, title, color, children }) {
  const colors = {
    blue: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-200 dark:border-blue-800",
    purple: "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/10 border-purple-200 dark:border-purple-800",
    green: "from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/10 border-green-200 dark:border-green-800",
    orange: "from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 border-orange-200 dark:border-orange-800",
  };
  return (
    <div className={`p-5 rounded-xl border bg-gradient-to-br ${colors[color] || colors.blue}`}>
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FAQ Item Component
// ─────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-medium text-sm text-gray-800 dark:text-gray-100 pr-4">{q}</span>
        <span className="flex-shrink-0 text-gray-400">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3 bg-gray-50/50 dark:bg-gray-800/30">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
