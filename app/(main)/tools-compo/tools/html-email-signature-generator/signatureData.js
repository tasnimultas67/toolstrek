/* -------------------------------------------------------------------------- */
/*  HTML Email Signature Generator — presets, social networks and HTML builder */
/* -------------------------------------------------------------------------- */

export const SIGNATURE_FAQS = [
  {
    question: "Will this signature work in Gmail, Outlook and Apple Mail?",
    answer:
      "The generated HTML uses table-based layout and inline CSS, which is the most compatible approach for email clients. Gmail, Outlook (desktop and web), Apple Mail, Thunderbird and Office 365 all render the core layout. Some advanced touches — such as border radius or gradients — may be simplified by older Outlook versions, but the signature remains readable and clickable.",
  },
  {
    question: "How do I install the signature in Gmail?",
    answer:
      "Generate the signature, click Copy rich signature, then open Gmail Settings → See all settings → General → Signature. Create a signature, paste with Ctrl/Cmd + V, and save changes. If the paste looks plain, download the HTML file and use an import helper, or copy from the preview panel instead.",
  },
  {
    question: "How do I add it to Outlook?",
    answer:
      "Use Copy rich signature and paste directly into Outlook's signature editor, or download the .html file and place it in Outlook's signature folder. On Outlook Web, open Settings → Mail → Compose and reply → Signature, then paste the rich version.",
  },
  {
    question: "Should I upload a photo or use a URL?",
    answer:
      "A URL is the most reliable option because several email clients block embedded data: images. Uploading is convenient for previewing and for clients that allow it, but for a signature you send to others, host the image on your website or a trusted CDN and paste the HTTPS URL. The tool supports both and keeps you in control.",
  },
  {
    question: "Why is my photo or logo not showing for recipients?",
    answer:
      "Most clients block remote images until the recipient chooses to load them. Use a small, compressed image over HTTPS, keep it under 100 KB, and add meaningful alt text. Avoid local file paths and data: URLs for production signatures.",
  },
  {
    question: "Is the signature responsive?",
    answer:
      "Yes, as far as email allows. The outer table is fluid up to your chosen maximum width, text wraps naturally, and the layout switches gracefully on narrow screens. Some desktop clients have fixed rendering engines, so test in the client you use most.",
  },
  {
    question: "Does anything get uploaded to a server?",
    answer:
      "No. The editor, preview, HTML generation, image reading and downloads all happen in your browser. Your contact details and images never leave the page.",
  },
  {
    question: "Can I save a signature and come back later?",
    answer:
      "Yes. Use Download JSON to save your full configuration, then Import JSON to restore it later. The vCard download is a separate convenience for adding your contact details to an address book.",
  },
];

export const FONT_OPTIONS = [
  { value: "Arial, Helvetica, sans-serif", label: "Arial / Helvetica" },
  { value: "'Segoe UI', Tahoma, sans-serif", label: "Segoe UI" },
  { value: "'Trebuchet MS', Helvetica, sans-serif", label: "Trebuchet MS" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "'Courier New', Courier, monospace", label: "Courier New" },
  { value: "system-ui, -apple-system, 'Segoe UI', sans-serif", label: "System UI" },
];

export const SOCIAL_NETWORKS = [
  { id: "linkedin", label: "LinkedIn", short: "in", color: "#0a66c2" },
  { id: "x", label: "X / Twitter", short: "X", color: "#0f172a" },
  { id: "facebook", label: "Facebook", short: "f", color: "#1877f2" },
  { id: "instagram", label: "Instagram", short: "ig", color: "#d62976" },
  { id: "github", label: "GitHub", short: "gh", color: "#24292f" },
  { id: "youtube", label: "YouTube", short: "yt", color: "#ff0033" },
  { id: "whatsapp", label: "WhatsApp", short: "wa", color: "#25d366" },
  { id: "telegram", label: "Telegram", short: "tg", color: "#229ed9" },
  { id: "dribbble", label: "Dribbble", short: "dr", color: "#ea4c89" },
  { id: "behance", label: "Behance", short: "be", color: "#1769ff" },
  { id: "medium", label: "Medium", short: "md", color: "#0f172a" },
  { id: "tiktok", label: "TikTok", short: "tt", color: "#0f172a" },
  { id: "custom", label: "Custom link", short: "↗", color: "#7c3aed" },
];

export const TEMPLATES = [
  {
    value: "classic",
    label: "Classic",
    description: "Photo, identity and contact details in a clean two-column layout.",
  },
  {
    value: "modern",
    label: "Modern",
    description: "An accent rule and a confident, editorial feel.",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Typography-first, no photo, nothing unnecessary.",
  },
  {
    value: "card",
    label: "Card",
    description: "A bordered card with generous padding and a soft background.",
  },
  {
    value: "banner",
    label: "Banner",
    description: "A coloured header band with contact details underneath.",
  },
];

export const LAYOUT_OPTIONS = [
  { value: "left", label: "Photo left" },
  { value: "right", label: "Photo right" },
  { value: "stacked", label: "Stacked" },
];

export const PHOTO_SHAPE_OPTIONS = [
  { value: "circle", label: "Circle" },
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Square" },
];

export const SOCIAL_STYLE_OPTIONS = [
  { value: "pill", label: "Pills" },
  { value: "icon", label: "Icons" },
  { value: "text", label: "Text links" },
];

export const DIVIDER_STYLE_OPTIONS = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "gradient", label: "Gradient" },
];

export const DEFAULT_SIGNATURE = {
  template: "classic",
  layout: "left",
  width: 480,
  padding: 20,
  radius: 12,
  spacing: 10,
  fontFamily: "Arial, Helvetica, sans-serif",
  baseSize: 14,
  lineHeight: 1.5,
  textColor: "#334155",
  mutedColor: "#64748b",
  headingColor: "#0f172a",
  accentColor: "#7c3aed",
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  showBorder: false,

  name: "Alex Morgan",
  nameSize: 20,
  nameWeight: "700",
  nameTransform: "none",
  showPronouns: true,
  pronouns: "they/them",
  role: "Senior Product Designer",
  company: "Northwind Studio",
  showCompany: true,
  tagline: "Designing calmer software for busy teams.",
  showTagline: true,

  email: "alex@northwind.studio",
  phone: "+1 (555) 014-8820",
  website: "https://northwind.studio",
  address: "120 Market Street, San Francisco, CA",
  showLabels: true,
  showAddress: true,

  photo: "",
  showPhoto: true,
  photoSize: 88,
  photoShape: "circle",
  photoAlt: "Portrait of Alex Morgan",

  logo: "",
  showLogo: false,
  logoSize: 44,

  showDivider: true,
  dividerStyle: "solid",
  dividerThickness: 2,
  dividerWidth: 100,

  showSocial: true,
  socialStyle: "icon",
  socials: [
    { id: "linkedin", network: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/alexmorgan" },
    { id: "github", network: "github", label: "GitHub", url: "https://github.com/alexmorgan" },
    { id: "x", network: "x", label: "X", url: "https://x.com/alexmorgan" },
  ],

  showCta: false,
  ctaText: "Book a 15-minute call",
  ctaUrl: "https://cal.com/alexmorgan/intro",
  ctaBg: "#7c3aed",
  ctaColor: "#ffffff",
  ctaRadius: 8,

  showAvailability: false,
  availabilityText: "Available for new projects",
  availabilityColor: "#10b981",

  showDisclaimer: true,
  disclaimer:
    "This message and any attachments are confidential and intended only for the named recipient. If you received it in error, please delete it and notify the sender.",

  showBadge: false,
  badgeText: "Carbon neutral since 2024",
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeHttpUrl(value, fallback = "#") {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  if (/^(https?:|mailto:|tel:)/i.test(text)) return escapeHtml(text);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return escapeHtml(`mailto:${text}`);
  if (/^[+\d][\d\s().-]{5,}$/.test(text)) return escapeHtml(`tel:${text.replace(/[^\d+]/g, "")}`);
  return escapeHtml(`https://${text.replace(/^\/+/, "")}`);
}

export function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export function isValidUrl(value) {
  if (!value) return true;
  const text = String(value).trim();
  if (/^(https?:|mailto:|tel:)/i.test(text)) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}(\/.*)?$/.test(text);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || min));
}

function initialAvatar(name, color, size, shape) {
  const initials =
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AM";
  const radius = shape === "circle" ? "50%" : shape === "rounded" ? "18%" : "0";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:${size}px;height:${size}px;">
    <tr>
      <td align="center" valign="middle" style="width:${size}px;height:${size}px;background:${color};border-radius:${radius};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:${Math.round(size / 2.6)}px;font-weight:700;letter-spacing:0.02em;">${escapeHtml(initials)}</td>
    </tr>
  </table>`;
}

function renderPhoto(state) {
  const size = clamp(state.photoSize, 40, 160);
  const radius = state.photoShape === "circle" ? "50%" : state.photoShape === "rounded" ? "16%" : "0";
  if (!state.showPhoto) return "";
  if (state.photo) {
    return `<img src="${escapeHtml(state.photo)}" width="${size}" height="${size}" alt="${escapeHtml(
      state.photoAlt || state.name,
    )}" style="display:block;width:${size}px;height:${size}px;max-width:${size}px;border-radius:${radius};object-fit:cover;border:0;outline:none;text-decoration:none;" />`;
  }
  return initialAvatar(state.name, state.accentColor, size, state.photoShape);
}

function renderLogo(state) {
  const size = clamp(state.logoSize, 24, 120);
  if (!state.showLogo || !state.logo) return "";
  return `<img src="${escapeHtml(state.logo)}" width="${size}" height="${size}" alt="${escapeHtml(
    state.company || "Company logo",
  )}" style="display:block;width:${size}px;height:${size}px;max-width:${size}px;object-fit:contain;border:0;" />`;
}

function renderContactRows(state, fontSize) {
  const rows = [];
  const labelStyle = `color:${state.mutedColor};font-weight:700;`;
  const linkStyle = `color:${state.textColor};text-decoration:none;`;

  if (state.email) {
    rows.push({
      label: "Email",
      value: `<a href="${sanitizeHttpUrl(state.email)}" style="${linkStyle}">${escapeHtml(state.email)}</a>`,
    });
  }
  if (state.phone) {
    rows.push({
      label: "Phone",
      value: `<a href="${sanitizeHttpUrl(state.phone)}" style="${linkStyle}">${escapeHtml(state.phone)}</a>`,
    });
  }
  if (state.website) {
    const label = String(state.website).replace(/^https?:\/\//i, "").replace(/\/$/, "");
    rows.push({
      label: "Web",
      value: `<a href="${sanitizeHttpUrl(state.website)}" style="${linkStyle}">${escapeHtml(label)}</a>`,
    });
  }
  if (state.showAddress && state.address) {
    rows.push({
      label: "Address",
      value: `<span style="${linkStyle}">${escapeHtml(state.address)}</span>`,
    });
  }

  return rows
    .map(
      (row) => `<tr>
        <td style="padding:1px 0;font-family:${state.fontFamily};font-size:${fontSize}px;line-height:${state.lineHeight};">
          ${state.showLabels ? `<span style="${labelStyle}">${row.label}:&nbsp;</span>` : ""}${row.value}
        </td>
      </tr>`,
    )
    .join("");
}

function socialMeta(id) {
  return SOCIAL_NETWORKS.find((network) => network.id === id) || SOCIAL_NETWORKS[SOCIAL_NETWORKS.length - 1];
}

function renderSocials(state, fontSize) {
  if (!state.showSocial) return "";
  const entries = (state.socials || []).filter((item) => item && item.url);
  if (!entries.length) return "";

  if (state.socialStyle === "text") {
    return `<div style="margin-top:${state.spacing}px;font-family:${state.fontFamily};font-size:${fontSize}px;line-height:${state.lineHeight};">
      ${entries
        .map((item) => {
          const meta = socialMeta(item.network);
          return `<a href="${sanitizeHttpUrl(item.url)}" style="color:${state.accentColor};text-decoration:none;font-weight:700;">${escapeHtml(
            item.label || meta.label,
          )}</a>`;
        })
        .join(`<span style="color:${state.mutedColor};"> &nbsp;·&nbsp; </span>`)}
    </div>`;
  }

  if (state.socialStyle === "icon") {
    return `<div style="margin-top:${state.spacing}px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          ${entries
            .map((item) => {
              const meta = socialMeta(item.network);
              return `<td style="padding:0 6px 0 0;">
                <a href="${sanitizeHttpUrl(item.url)}" title="${escapeHtml(item.label || meta.label)}" style="display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;background:${meta.color};border-radius:8px;color:#ffffff;font-family:${state.fontFamily};font-size:14px;font-weight:700;text-decoration:none;">${escapeHtml(
                  meta.short,
                )}</a>
              </td>`;
            })
            .join("")}
        </tr>
      </table>
    </div>`;
  }

  return `<div style="margin-top:${state.spacing}px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr>
        ${entries
          .map((item) => {
            const meta = socialMeta(item.network);
            return `<td style="padding:0 6px 6px 0;">
              <a href="${sanitizeHttpUrl(item.url)}" style="display:inline-block;padding:5px 11px;border-radius:999px;background:${meta.color}14;border:1px solid ${meta.color}55;color:${meta.color};font-family:${state.fontFamily};font-size:${fontSize}px;font-weight:700;text-decoration:none;">${escapeHtml(
                item.label || meta.label,
              )}</a>
            </td>`;
          })
          .join("")}
      </tr>
    </table>
  </div>`;
}

function renderCta(state, fontSize) {
  if (!state.showCta || !state.ctaText) return "";
  return `<div style="margin-top:${state.spacing + 4}px;">
    <a href="${sanitizeHttpUrl(state.ctaUrl)}" style="display:inline-block;padding:10px 18px;border-radius:${clamp(
      state.ctaRadius,
      0,
      24,
    )}px;background:${state.ctaBg};color:${state.ctaColor};font-family:${state.fontFamily};font-size:${fontSize}px;font-weight:700;text-decoration:none;">${escapeHtml(
      state.ctaText,
    )}</a>
  </div>`;
}

function renderDivider(state) {
  if (!state.showDivider) return "";
  const width = clamp(state.dividerWidth, 10, 100);
  const thickness = clamp(state.dividerThickness, 1, 6);
  const background =
    state.dividerStyle === "gradient"
      ? `linear-gradient(90deg, ${state.accentColor}, ${state.accentColor}00)`
      : state.accentColor;
  const borderStyle = ["dashed", "dotted"].includes(state.dividerStyle)
    ? `border-top:${thickness}px ${state.dividerStyle} ${state.accentColor};height:0;`
    : `height:${thickness}px;background:${background};border-radius:999px;`;
  return `<div style="margin:${state.spacing}px 0;width:${width}%;${borderStyle}"></div>`;
}

function renderIdentity(state, fontSize) {
  const nameTransform = state.nameTransform === "uppercase" ? "uppercase" : state.nameTransform === "capitalize" ? "capitalize" : "none";
  const pronouns =
    state.showPronouns && state.pronouns
      ? `<span style="font-family:${state.fontFamily};font-size:${fontSize}px;font-weight:400;color:${state.mutedColor};"> (${escapeHtml(
          state.pronouns,
        )})</span>`
      : "";
  const tagline =
    state.showTagline && state.tagline
      ? `<div style="margin-top:3px;font-family:${state.fontFamily};font-size:${fontSize}px;line-height:${state.lineHeight};color:${state.mutedColor};">${escapeHtml(
          state.tagline,
        )}</div>`
      : "";
  const company =
    state.showCompany && state.company
      ? `<div style="margin-top:2px;font-family:${state.fontFamily};font-size:${fontSize}px;line-height:${state.lineHeight};font-weight:700;color:${state.accentColor};">${escapeHtml(
          state.company,
        )}</div>`
      : "";

  return `<div>
    <div style="font-family:${state.fontFamily};font-size:${clamp(
      state.nameSize,
      16,
      40,
    )}px;line-height:1.2;font-weight:${state.nameWeight};color:${state.headingColor};text-transform:${nameTransform};letter-spacing:-0.01em;">${escapeHtml(
      state.name,
    )}${pronouns}</div>
    ${state.role ? `<div style="margin-top:3px;font-family:${state.fontFamily};font-size:${fontSize}px;line-height:${state.lineHeight};font-weight:600;color:${state.textColor};">${escapeHtml(state.role)}</div>` : ""}
    ${company}
    ${tagline}
  </div>`;
}

function renderAvailability(state, fontSize) {
  if (!state.showAvailability || !state.availabilityText) return "";
  return `<div style="margin-top:${state.spacing}px;">
    <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${state.availabilityColor}18;border:1px solid ${state.availabilityColor}55;color:${state.availabilityColor};font-family:${state.fontFamily};font-size:${fontSize}px;font-weight:700;">${escapeHtml(
      state.availabilityText,
    )}</span>
  </div>`;
}

function renderBadge(state, fontSize) {
  if (!state.showBadge || !state.badgeText) return "";
  return `<div style="margin-top:6px;font-family:${state.fontFamily};font-size:${fontSize}px;line-height:${state.lineHeight};color:${state.mutedColor};">${escapeHtml(
    state.badgeText,
  )}</div>`;
}

function renderDisclaimer(state, fontSize) {
  if (!state.showDisclaimer || !state.disclaimer) return "";
  return `<div style="margin-top:${state.spacing + 6}px;padding-top:${state.spacing}px;border-top:1px solid ${state.borderColor};font-family:${state.fontFamily};font-size:${fontSize}px;line-height:1.55;color:${state.mutedColor};">${escapeHtml(
    state.disclaimer,
  )}</div>`;
}

function renderBody(state, fontSize) {
  const contacts = renderContactRows(state, fontSize);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
    <tr>
      <td style="padding:0;vertical-align:top;">
        ${renderIdentity(state, fontSize)}
        ${contacts ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:${state.spacing}px;">${contacts}</table>` : ""}
        ${renderAvailability(state, fontSize)}
        ${renderDivider(state)}
        ${renderSocials(state, fontSize)}
        ${renderCta(state, fontSize)}
        ${renderBadge(state, fontSize)}
      </td>
    </tr>
  </table>`;
}

function renderPhotoAndBody(state, fontSize, photoFirst) {
  const photo = renderPhoto(state);
  if (!photo) return renderBody(state, fontSize);
  const photoCell = `<td width="${clamp(state.photoSize, 40, 160) + 16}" style="width:${clamp(
    state.photoSize,
    40,
    160,
  ) + 16}px;padding:0;vertical-align:top;">${photo}</td>`;
  const bodyCell = `<td style="padding:0;vertical-align:top;">${renderBody(state, fontSize)}</td>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
    <tr>
      ${photoFirst ? photoCell : ""}
      ${bodyCell}
      ${photoFirst ? "" : photoCell}
    </tr>
  </table>`;
}

export function buildSignatureHtml(input) {
  const state = { ...DEFAULT_SIGNATURE, ...input };
  const baseSize = clamp(state.baseSize, 14, 24);
  const smallSize = Math.max(14, baseSize - 0);
  const maxWidth = clamp(state.width, 320, 760);
  const padding = clamp(state.padding, 0, 48);
  const radius = clamp(state.radius, 0, 32);
  const font = state.fontFamily;
  const outerBorder =
    state.showBorder || state.template === "card"
      ? `border:1px solid ${state.borderColor};`
      : "border:0;";
  const background = state.template === "minimal" ? "transparent" : state.backgroundColor;

  let inner = "";

  if (state.template === "banner") {
    inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;border-radius:${radius}px;overflow:hidden;${outerBorder}background:${background};">
      <tr>
        <td style="padding:${padding}px ${padding}px ${Math.round(padding / 2)}px;background:${state.accentColor};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
            <tr>
              ${state.showPhoto ? `<td width="${clamp(state.photoSize, 40, 160) + 16}" style="vertical-align:middle;">${renderPhoto(state)}</td>` : ""}
              <td style="vertical-align:middle;">
                <div style="font-family:${font};font-size:${clamp(state.nameSize, 16, 40)}px;line-height:1.2;font-weight:${state.nameWeight};color:#ffffff;">${escapeHtml(
                  state.name,
                )}</div>
                ${state.role ? `<div style="margin-top:3px;font-family:${font};font-size:${smallSize}px;line-height:1.4;color:#ffffff;opacity:0.9;">${escapeHtml(state.role)}</div>` : ""}
                ${state.showCompany && state.company ? `<div style="margin-top:2px;font-family:${font};font-size:${smallSize}px;line-height:1.4;font-weight:700;color:#ffffff;">${escapeHtml(state.company)}</div>` : ""}
              </td>
              ${state.showLogo && state.logo ? `<td align="right" style="vertical-align:middle;padding-left:12px;">${renderLogo(state)}</td>` : ""}
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:${Math.round(padding / 2)}px ${padding}px ${padding}px;background:${background};">
          ${renderContactRows(state, smallSize) ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${renderContactRows(state, smallSize)}</table>` : ""}
          ${renderAvailability(state, smallSize)}
          ${renderSocials(state, smallSize)}
          ${renderCta(state, smallSize)}
          ${renderBadge(state, smallSize)}
          ${renderDisclaimer(state, smallSize)}
        </td>
      </tr>
    </table>`;
  } else if (state.template === "minimal") {
    inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:${maxWidth}px;font-family:${font};">
      <tr>
        <td style="padding:${padding}px 0;vertical-align:top;">
          ${renderIdentity(state, baseSize)}
          ${renderContactRows(state, smallSize) ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:${state.spacing}px;">${renderContactRows(state, smallSize)}</table>` : ""}
          ${renderDivider(state)}
          ${renderSocials(state, smallSize)}
          ${renderCta(state, smallSize)}
          ${renderAvailability(state, smallSize)}
          ${renderBadge(state, smallSize)}
          ${renderDisclaimer(state, smallSize)}
        </td>
      </tr>
    </table>`;
  } else if (state.template === "card") {
    inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:${maxWidth}px;background:${background};border:1px solid ${state.borderColor};border-radius:${radius}px;">
      <tr>
        <td style="padding:${padding}px;">
          ${state.layout === "stacked" && state.showPhoto
            ? `<div style="margin-bottom:${state.spacing}px;">${renderPhoto(state)}</div>${renderBody(state, baseSize)}`
            : state.layout === "stacked"
              ? renderBody(state, baseSize)
              : renderPhotoAndBody(state, baseSize, state.layout !== "right")}
        </td>
      </tr>
      ${state.showDisclaimer && state.disclaimer
        ? `<tr><td style="padding:0 ${padding}px ${padding}px;">${renderDisclaimer(state, smallSize)}</td></tr>`
        : ""}
    </table>`;
  } else {
    const accentBar =
      state.template === "modern"
        ? `<td width="4" style="width:4px;background:${state.accentColor};border-radius:999px;"></td>`
        : "";
    const gap = state.template === "modern" ? `<td width="${state.spacing}" style="width:${state.spacing}px;"></td>` : "";
    inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:${maxWidth}px;background:${background};border-radius:${radius}px;${outerBorder}">
      <tr>
        <td style="padding:${padding}px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
            <tr>
              ${accentBar}
              ${accentBar ? gap : ""}
              <td style="vertical-align:top;">
                ${state.layout === "stacked" && state.showPhoto
                  ? `<div style="margin-bottom:${state.spacing}px;">${renderPhoto(state)}</div>${renderBody(state, baseSize)}`
                  : state.layout === "stacked"
                    ? renderBody(state, baseSize)
                    : renderPhotoAndBody(state, baseSize, state.layout !== "right")}
              </td>
            </tr>
          </table>
          ${renderDisclaimer(state, smallSize)}
        </td>
      </tr>
    </table>`;
  }

  return `<!-- ToolsTrek HTML Email Signature Generator -->
<div style="font-family:${font};font-size:${baseSize}px;line-height:${state.lineHeight};color:${state.textColor};max-width:${maxWidth}px;">
${inner}
</div>`;
}

export function buildPlainText(input) {
  const state = { ...DEFAULT_SIGNATURE, ...input };
  const lines = [
    state.name,
    state.role,
    state.showCompany ? state.company : "",
    state.showTagline ? state.tagline : "",
    "",
    state.email ? `Email: ${state.email}` : "",
    state.phone ? `Phone: ${state.phone}` : "",
    state.website ? `Web: ${state.website}` : "",
    state.showAddress ? state.address : "",
    "",
    state.showSocial ? (state.socials || []).filter((s) => s.url).map((s) => `${s.label}: ${s.url}`).join("\n") : "",
    state.showCta ? `${state.ctaText}: ${state.ctaUrl}` : "",
    state.showAvailability ? state.availabilityText : "",
    state.showDisclaimer ? `\n${state.disclaimer}` : "",
  ];
  return lines.filter((line) => line !== "").join("\n").trim();
}

function escapeVcard(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildVcard(input) {
  const state = { ...DEFAULT_SIGNATURE, ...input };
  const [first = "", ...rest] = String(state.name || "").trim().split(/\s+/);
  const phone = String(state.phone || "").replace(/[^\d+]/g, "");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(rest.join(" "))};${escapeVcard(first)};;;`,
    `FN:${escapeVcard(state.name)}`,
    state.showCompany && state.company ? `ORG:${escapeVcard(state.company)}` : "",
    state.role ? `TITLE:${escapeVcard(state.role)}` : "",
    state.email && isValidEmail(state.email) ? `EMAIL;TYPE=INTERNET:${escapeVcard(state.email)}` : "",
    phone ? `TEL;TYPE=CELL:${phone}` : "",
    state.website ? `URL:${escapeVcard(state.website)}` : "",
    state.showAddress && state.address ? `ADR;TYPE=WORK:;;${escapeVcard(state.address)};;;;` : "",
    state.showTagline && state.tagline ? `NOTE:${escapeVcard(state.tagline)}` : "",
    "END:VCARD",
  ];
  return lines.filter(Boolean).join("\r\n");
}

export function buildSignatureCssVariables(input) {
  const state = { ...DEFAULT_SIGNATURE, ...input };
  return {
    fontFamily: state.fontFamily,
    background: state.backgroundColor,
    color: state.textColor,
  };
}
