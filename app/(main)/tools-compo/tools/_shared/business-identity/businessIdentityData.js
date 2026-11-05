/* -------------------------------------------------------------------------- */
/*  Business card & letterhead studio — templates, sizes and layout helpers.  */
/* -------------------------------------------------------------------------- */

export function storageKey(mode) {
  return mode === "letterhead" ? "toolstrek_letterhead_v1" : "toolstrek_business_card_v1";
}

export const CARD_SIZES = [
  { id: "us", label: "US / Canada", width: 88.9, height: 50.8, note: "3.5 × 2 in" },
  { id: "eu", label: "Europe / UK", width: 85, height: 55, note: "85 × 55 mm" },
  { id: "square", label: "Square", width: 65, height: 65, note: "65 × 65 mm" },
  { id: "slim", label: "Slim", width: 90, height: 40, note: "90 × 40 mm" },
  { id: "mini", label: "Mini", width: 70, height: 45, note: "70 × 45 mm" },
  { id: "custom", label: "Custom size", width: 88.9, height: 50.8, note: "Your dimensions" },
];

export const SHEET_SIZES = [
  { id: "a4", label: "A4", width: 210, height: 297 },
  { id: "letter", label: "US Letter", width: 215.9, height: 279.4 },
  { id: "a3", label: "A3", width: 297, height: 420 },
  { id: "legal", label: "US Legal", width: 215.9, height: 355.6 },
];

export const LETTERHEAD_SIZES = [
  { id: "a4", label: "A4 — 210 × 297 mm", width: 210, height: 297 },
  { id: "letter", label: "US Letter — 8.5 × 11 in", width: 215.9, height: 279.4 },
  { id: "a5", label: "A5 — 148 × 210 mm", width: 148, height: 210 },
];

export const CARD_TEMPLATES = [
  {
    value: "split",
    label: "Split",
    blurb: "Colour panel · monogram",
    description: "A confident accent panel with a monogram or logo, balanced by a clean contact column.",
  },
  {
    value: "modern",
    label: "Modern",
    blurb: "Top bar · airy",
    description: "A slim colour bar, generous whitespace and a single-line contact footer. Very versatile.",
  },
  {
    value: "bold",
    label: "Bold",
    blurb: "Full colour · high impact",
    description: "A full-colour card with reversed type. Works best with one strong brand colour.",
  },
  {
    value: "minimal",
    label: "Minimal",
    blurb: "Centred · typographic",
    description: "No blocks or decoration, just carefully spaced type between two hairlines.",
  },
  {
    value: "studio",
    label: "Studio",
    blurb: "Tinted · monogram block",
    description: "A soft tinted background with a monogram tile and a right-aligned contact column.",
  },
];

export const LETTERHEAD_TEMPLATES = [
  { value: "classic", label: "Classic", blurb: "Top rule · footer band" },
  { value: "modern", label: "Modern", blurb: "Side band · logo left" },
  { value: "minimal", label: "Minimal", blurb: "Centred · hairline rules" },
  { value: "executive", label: "Executive", blurb: "Dark header · accent rule" },
];

export const BRAND_COLOURS = [
  { value: "#7c3aed", label: "Violet" },
  { value: "#2563eb", label: "Blue" },
  { value: "#0f766e", label: "Teal" },
  { value: "#be123c", label: "Crimson" },
  { value: "#ea580c", label: "Orange" },
  { value: "#0f172a", label: "Ink" },
  { value: "#4d7c0f", label: "Olive" },
  { value: "#a21caf", label: "Magenta" },
];

export const FONT_OPTIONS = [
  {
    value: "sans",
    label: "Sans",
    stack: "Helvetica, Arial, 'Segoe UI', system-ui, sans-serif",
    headingWeight: 700,
  },
  {
    value: "serif",
    label: "Serif",
    stack: "Georgia, 'Times New Roman', serif",
    headingWeight: 700,
  },
  {
    value: "mono",
    label: "Mono",
    stack: "'SFMono-Regular', Menlo, Consolas, monospace",
    headingWeight: 600,
  },
  {
    value: "display",
    label: "Display",
    stack: "'Trebuchet MS', 'Gill Sans', 'Segoe UI', sans-serif",
    headingWeight: 800,
  },
];

export const CARD_FAQS = [
  {
    question: "What size should a business card be?",
    answer:
      "In the US and Canada the standard is 3.5 × 2 inches (88.9 × 50.8 mm). In Europe, the UK and most of Asia, 85 × 55 mm is the norm. Square and slim formats are popular for creative studios, but always confirm the printer's trim size before ordering.",
  },
  {
    question: "How much bleed does a business card need?",
    answer:
      "Add 3 mm (0.125 in) of bleed on every edge when any colour or image runs to the edge. That makes the document 94.9 × 56.8 mm for a US card and 91 × 61 mm for a European card. Keep text at least 3–4 mm inside the trim line.",
  },
  {
    question: "Can I export a print-ready PDF?",
    answer:
      "Yes. The export renders your design at 300 DPI and places it on a page sized to your card or card back. When crop marks are enabled, the PDF adds a margin and corner marks so a print shop can trim the job accurately.",
  },
  {
    question: "How many cards fit on one sheet?",
    answer:
      "It depends on the card and sheet size, the gap between cards and the sheet margin. With a US card and a 4 mm gap on A4, the layout section shows the exact grid and copy count. Adjust the gap or margin to see how many more fit.",
  },
  {
    question: "Can I add a QR code to my card?",
    answer:
      "Yes. Enter any URL, email address, phone number or plain text and the maker generates a QR code locally. It is embedded in the preview, the PNG and the PDF. Test-scan the exported file before sending it to print.",
  },
  {
    question: "What paper and finish should I choose?",
    answer:
      "350–400 gsm card stock feels substantial without becoming brittle. A matte or soft-touch laminate is easy to write on, while a gloss finish makes colours pop. Spot UV, foil and letterpress add cost, so ask for a proof before a large run.",
  },
  {
    question: "Is my logo uploaded to a server?",
    answer:
      "No. The logo and contact details never leave your browser. Everything is rendered on your device and saved to local storage so you can pick up where you left off.",
  },
  {
    question: "Can I reuse the design later?",
    answer:
      "Yes. Export the project as JSON from the maker. It stores your brand details, colours, template choices and print settings so you can import it on another device or hand it to a colleague. The logo is included in the file when you add one.",
  },
];

export const LETTERHEAD_FAQS = [
  {
    question: "What size should a letterhead be?",
    answer:
      "A4 (210 × 297 mm) is the standard in most of the world and US Letter (8.5 × 11 in) in the United States and Canada. A5 is useful for short notes and compliments slips. Choose the same paper your printer stocks so the final trim and margins match your proof.",
  },
  {
    question: "How much margin and bleed should a letterhead use?",
    answer:
      "Keep at least 15–20 mm of clear margin for body copy and leave room for a signature. Add 3 mm of bleed on every edge when a colour band or image runs to the edge. The preview marks the trim and safe area so nothing important is clipped.",
  },
  {
    question: "Can I export a print-ready PDF?",
    answer:
      "Yes. The letterhead is rendered at 300 DPI on a page sized to A4, US Letter, A5 or your chosen paper. With crop marks enabled, the PDF adds a margin and corner marks so a print shop can trim accurately.",
  },
  {
    question: "What should a letterhead include?",
    answer:
      "The company name and logo, a postal address, phone number, email, website and any registration or tax details your market requires. Keep the footer compact so the body copy has room to breathe, and leave a clear signature area at the end.",
  },
  {
    question: "Can I match the letterhead to my business card?",
    answer:
      "Yes. Use the same brand colour, ink colour, typeface and logo. The Business Card Maker uses the same design tokens, so you can build a matching card and letterhead without a separate design file. Layouts can differ to suit the format.",
  },
  {
    question: "Is my logo uploaded to a server?",
    answer:
      "No. The logo, company details and letter copy never leave your browser. Everything is rendered on your device and saved to local storage so you can pick up where you left off.",
  },
  {
    question: "Can I reuse the design later?",
    answer:
      "Yes. Export the project as JSON and import it on another device or hand it to a colleague. It stores the brand details, colours, template choice, paper size and letter content. The logo is included in the file when you add one.",
  },
  {
    question: "Can I write the letter inside the tool?",
    answer:
      "Yes. Add a recipient block, subject, body, closing and signature, and the preview shows exactly what will export. Leave those fields blank if you only need a blank letterhead to print and write on later.",
  },
];

export const EMPTY_BUSINESS_STATE = {
  mode: "card",
  cardTemplate: "split",
  letterheadTemplate: "classic",
  font: "sans",
  accent: "#7c3aed",
  secondary: "#0f172a",
  cardSize: "us",
  customWidth: "",
  customHeight: "",
  letterheadSize: "a4",
  bleed: "3",
  safe: "4",
  cropMarks: false,
  showGuides: true,
  sheetPaper: "a4",
  sheetMargin: "10",
  sheetGap: "4",
  qrEnabled: true,
  qrValue: "",
  logo: "",
  logoName: "",
  contact: {
    name: "",
    role: "",
    company: "",
    tagline: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    services: "",
  },
  back: {
    enabled: false,
    headline: "",
    note: "",
  },
  letter: {
    subject: "",
    body: "",
    closing: "",
    signature: "",
    recipient: "",
  },
};

export function createEmptyBusinessState(mode = "card") {
  return {
    ...EMPTY_BUSINESS_STATE,
    mode: mode === "letterhead" ? "letterhead" : "card",
    contact: { ...EMPTY_BUSINESS_STATE.contact },
    back: { ...EMPTY_BUSINESS_STATE.back },
    letter: { ...EMPTY_BUSINESS_STATE.letter },
  };
}

export function createDemoBusinessState(mode = "card") {
  const contact = {
    name: "Ayesha Rahman",
    role: "Brand & Product Designer",
    company: "Northline Studio",
    tagline: "Identity systems, packaging and digital products that feel effortless.",
    phone: "+1 (415) 555-0134",
    email: "hello@northline.studio",
    website: "northline.studio",
    address: "18 Mercer Street, Suite 400, New York, NY 10013",
    services: "Brand strategy\nVisual identity\nPackaging\nWebsite design",
  };

  const base = {
    ...createEmptyBusinessState(mode),
    cardTemplate: "split",
    letterheadTemplate: "classic",
    accent: "#7c3aed",
    secondary: "#0f172a",
    cardSize: "us",
    letterheadSize: "a4",
    bleed: "3",
    safe: "4",
    cropMarks: true,
    showGuides: true,
    qrEnabled: mode === "card",
    qrValue: mode === "card" ? "https://northline.studio" : "",
    contact,
  };

  if (mode === "letterhead") {
    return {
      ...base,
      letter: {
        subject: "Proposal: Brand refresh for Meridian Coffee",
        recipient: "Ms. Clara Mendes\nMeridian Coffee Roasters\n42 Harbour Lane\nPortland, OR 97209",
        body:
          "Thank you for inviting Northline Studio to look at the Meridian brand. We have spent the past two weeks reviewing your packaging, your café touchpoints and the way customers describe you online.\n\nThe short version: Meridian already has the hardest asset — a product people recommend by name. What it lacks is a system that makes that recommendation easy to recognise on a shelf, on a menu and on a phone screen.\n\nOur proposed engagement runs for six weeks. We will audit the current identity, define a clear verbal and visual platform, then design a flexible packaging system with a concise set of rules your team can apply without us in the room.\n\nThe investment is $18,400, split across three milestones. The full scope, timeline and deliverables are set out in the attached document. We would be glad to walk you through it on Thursday.",
        closing: "Warm regards,",
        signature: "Ayesha Rahman\nFounder & Design Director",
      },
    };
  }

  return {
    ...base,
    back: {
      enabled: true,
      headline: "Let's build something clear.",
      note: "Book a 20-minute intro call at northline.studio/call",
    },
  };
}

/* --------------------------------- Helpers -------------------------------- */

export function parseHex(hex) {
  const value = String(hex || "").replace("#", "").trim();
  if (value.length === 3) {
    return {
      r: parseInt(value[0] + value[0], 16),
      g: parseInt(value[1] + value[1], 16),
      b: parseInt(value[2] + value[2], 16),
    };
  }
  if (value.length === 6) {
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }
  return { r: 15, g: 23, b: 42 };
}

/** Pick white or ink for text sitting on a hex background. */
export function readableOn(hex) {
  const { r, g, b } = parseHex(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#0f172a" : "#ffffff";
}

export function initialsOf(value, fallback = "TT") {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return fallback;
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/** Split text into lines that fit roughly inside `maxWidth` at `fontSize` mm. */
export function wrapLines(text, maxWidth, fontSize, maxLines = 12) {
  const raw = String(text || "");
  if (!raw.trim()) return [];
  const charsPerLine = Math.max(8, Math.floor(maxWidth / (fontSize * 0.52)));
  const result = [];
  raw.split(/\r?\n/).forEach((paragraph) => {
    if (!paragraph.trim()) {
      result.push("");
      return;
    }
    const words = paragraph.trim().split(/\s+/);
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > charsPerLine && line) {
        result.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) result.push(line);
  });
  return result.slice(0, maxLines);
}

export function cardDimensions(state) {
  if (state.cardSize === "custom") {
    return {
      width: Number(state.customWidth) || 88.9,
      height: Number(state.customHeight) || 50.8,
    };
  }
  const preset = CARD_SIZES.find((item) => item.id === state.cardSize) || CARD_SIZES[0];
  return { width: preset.width, height: preset.height };
}

export function sheetDimensions(id) {
  return SHEET_SIZES.find((item) => item.id === id) || SHEET_SIZES[0];
}

export function letterheadDimensions(id) {
  return LETTERHEAD_SIZES.find((item) => item.id === id) || LETTERHEAD_SIZES[0];
}

export function impose({ sheetWidth, sheetHeight, itemWidth, itemHeight, gap, margin }) {
  const usableWidth = sheetWidth - margin * 2;
  const usableHeight = sheetHeight - margin * 2;
  if (!itemWidth || !itemHeight || usableWidth <= 0 || usableHeight <= 0) {
    return { columns: 0, rows: 0, count: 0, utilisation: 0, positions: [] };
  }
  const columns = Math.max(0, Math.floor((usableWidth + gap) / (itemWidth + gap)));
  const rows = Math.max(0, Math.floor((usableHeight + gap) / (itemHeight + gap)));
  const positions = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      positions.push({
        x: margin + column * (itemWidth + gap),
        y: margin + row * (itemHeight + gap),
      });
    }
  }
  const usedArea = columns * rows * itemWidth * itemHeight;
  return {
    columns,
    rows,
    count: columns * rows,
    utilisation: sheetWidth * sheetHeight ? (usedArea / (sheetWidth * sheetHeight)) * 100 : 0,
    positions,
  };
}

export function fontStack(value) {
  return (FONT_OPTIONS.find((item) => item.value === value) || FONT_OPTIONS[0]).stack;
}

export function fontHeadingWeight(value) {
  return (FONT_OPTIONS.find((item) => item.value === value) || FONT_OPTIONS[0]).headingWeight;
}
