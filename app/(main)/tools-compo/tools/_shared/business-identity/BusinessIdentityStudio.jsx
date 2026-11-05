"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import {
  BadgeCheck,
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  FileText,
  ImagePlus,
  Layers,
  Palette,
  Printer,
  QrCode,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
} from "../toolkit/ToolKit";
import {
  copyText,
  downloadText,
  parseJsonFile,
  readStored,
  toNumber,
  writeStored,
} from "../toolkit/toolUtils";
import {
  BRAND_COLOURS,
  CARD_FAQS,
  CARD_SIZES,
  CARD_TEMPLATES,
  FONT_OPTIONS,
  LETTERHEAD_FAQS,
  LETTERHEAD_SIZES,
  LETTERHEAD_TEMPLATES,
  SHEET_SIZES,
  cardDimensions,
  createDemoBusinessState,
  createEmptyBusinessState,
  fontHeadingWeight,
  fontStack,
  impose,
  initialsOf,
  letterheadDimensions,
  readableOn,
  sheetDimensions,
  storageKey,
  wrapLines,
} from "./businessIdentityData";

const TONE = "violet";

const MODES = {
  card: {
    tool: { title: "Business Card Maker", link: "/tools/business-card-maker", icon: "Contact" },
    eyebrow: "Print-ready card studio",
    heroTitle: "Business Card Maker",
    heroDescription:
      "Design a print-ready business card in your browser. Five layouts, US, European, square, slim and custom sizes, logo upload, QR codes, card back, bleed and safe-area preview, sheet imposition, and 300 DPI PNG or PDF export.",
    badges: ["Blank by default", "Logo & QR codes", "Bleed preview", "300 DPI export"],
    faqTitle: "Business card questions",
    faqs: CARD_FAQS,
  },
  letterhead: {
    tool: { title: "Letterhead Maker", link: "/tools/letterhead-maker", icon: "FileText" },
    eyebrow: "Print-ready stationery studio",
    heroTitle: "Letterhead Maker",
    heroDescription:
      "Create a professional letterhead in your browser. Four layouts, A4, US Letter, A5 and custom paper sizes, logo upload, brand colours and typefaces, bleed and safe-area preview, full letter content, and 300 DPI PNG or PDF export.",
    badges: ["Blank by default", "Logo upload", "Bleed preview", "300 DPI export"],
    faqTitle: "Letterhead questions",
    faqs: LETTERHEAD_FAQS,
  },
};

/* -------------------------------------------------------------------------- */
/*  SVG building blocks                                                       */
/* -------------------------------------------------------------------------- */

function SvgLines({ lines, x, y, size, fill, weight = 400, anchor = "start", lineHeight = 1.2, fontFamily, opacity = 1 }) {
  if (!lines || lines.length === 0) return null;
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fillOpacity={opacity}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fontFamily={fontFamily}
    >
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : size * lineHeight}>
          {line || " "}
        </tspan>
      ))}
    </text>
  );
}

function CardFront({ design, svgRef }) {
  const { width: w, height: h, accent, secondary, fontFamily, template, contact, qr, logo, monogram } = design;
  const onAccent = readableOn(accent);
  const p = Math.min(w, h) * 0.085;
  const nameSize = Math.min(h * 0.135, w * 0.1);
  const roleSize = Math.min(h * 0.062, w * 0.045);
  const bodySize = Math.min(h * 0.052, w * 0.038);
  const smallSize = Math.min(h * 0.048, w * 0.034);
  const qrSize = Math.min(h * 0.24, w * 0.17);
  const contactList = [contact.phone, contact.email, contact.website].filter(Boolean);
  const headingWeight = fontHeadingWeight(design.font);
  const splitNameLines = wrapLines(contact.name, w - w * 0.44 - p - (qr ? qrSize + 3 : 0), nameSize, 2);
  const modernNameLines = wrapLines(contact.name, w - p * 2 - (qr ? qrSize + 3 : 0), nameSize, 2);
  const splitNameBottom = p + nameSize + (splitNameLines.length > 1 ? nameSize * 1.03 : 0);
  const modernNameBottom = p + nameSize + (modernNameLines.length > 1 ? nameSize * 1.03 : 0);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Business card front preview"
    >
      <rect width={w} height={h} fill="#ffffff" />

      {template === "split" && (
        <>
          <rect width={w * 0.36} height={h} fill={accent} />
          {logo ? (
            <image href={logo} x={w * 0.055} y={p} width={w * 0.25} height={h * 0.17} preserveAspectRatio="xMinYMin meet" />
          ) : (
            <text
              x={w * 0.18}
              y={h * 0.33}
              textAnchor="middle"
              fill={onAccent}
              fontSize={h * 0.19}
              fontWeight={800}
              fontFamily={fontFamily}
            >
              {monogram}
            </text>
          )}
          <SvgLines
            lines={wrapLines(contact.company, w * 0.26, smallSize, 2)}
            x={w * 0.18}
            y={h * 0.51}
            size={smallSize}
            fill={onAccent}
            opacity={0.85}
            anchor="middle"
            fontFamily={fontFamily}
            weight={600}
          />
          <SvgLines
            lines={splitNameLines}
            x={w * 0.44}
            y={p + nameSize}
            size={nameSize}
            fill={secondary}
            weight={headingWeight}
            fontFamily={fontFamily}
            lineHeight={1.03}
          />
          <text
            x={w * 0.44}
            y={splitNameBottom + roleSize * 1.4}
            fill={accent}
            fontSize={roleSize}
            fontWeight={700}
            fontFamily={fontFamily}
          >
            {contact.role}
          </text>
          <SvgLines
            lines={wrapLines(contact.tagline, w * 0.48, bodySize, 3)}
            x={w * 0.44}
            y={Math.max(h * 0.6, splitNameBottom + roleSize * 2.6)}
            size={bodySize}
            fill={secondary}
            opacity={0.72}
            fontFamily={fontFamily}
            lineHeight={1.35}
          />
          {contactList.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x={w * 0.44}
              y={h - p - (contactList.length - 1 - index) * smallSize * 1.5}
              fill={secondary}
              fontSize={smallSize}
              fontWeight={600}
              fontFamily={fontFamily}
            >
              {line}
            </text>
          ))}
          {qr && <image href={qr} x={w - p - qrSize} y={p} width={qrSize} height={qrSize} />}
        </>
      )}

      {template === "modern" && (
        <>
          <rect width={w} height={h * 0.055} fill={accent} />
          <SvgLines
            lines={modernNameLines}
            x={p}
            y={p + nameSize}
            size={nameSize}
            fill={secondary}
            weight={headingWeight}
            fontFamily={fontFamily}
            lineHeight={1.03}
          />
          <text x={p} y={modernNameBottom + roleSize * 1.4} fill={accent} fontSize={roleSize} fontWeight={700} fontFamily={fontFamily}>
            {contact.role}
          </text>
          {contact.company && (
            <text
              x={w - p}
              y={p + smallSize}
              textAnchor="end"
              fill={secondary}
              fillOpacity={0.55}
              fontSize={smallSize}
              fontWeight={700}
              fontFamily={fontFamily}
            >
              {contact.company}
            </text>
          )}
          <SvgLines
            lines={wrapLines(contact.tagline, w * 0.55, bodySize, 3)}
            x={p}
            y={h * 0.62}
            size={bodySize}
            fill={secondary}
            opacity={0.72}
            fontFamily={fontFamily}
            lineHeight={1.35}
          />
          {contactList.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x={p}
              y={h - p - (contactList.length - 1 - index) * smallSize * 1.5}
              fill={secondary}
              fontSize={smallSize}
              fontWeight={600}
              fontFamily={fontFamily}
            >
              {line}
            </text>
          ))}
          {qr && <image href={qr} x={w - p - qrSize} y={h * 0.3} width={qrSize} height={qrSize} />}
        </>
      )}

      {template === "bold" && (
        <>
          <rect width={w} height={h} fill={accent} />
          {logo && <image href={logo} x={p} y={p} width={w * 0.24} height={h * 0.15} preserveAspectRatio="xMinYMin meet" />}
          <SvgLines
            lines={wrapLines(contact.name, w - p * 2 - (qr ? qrSize + 4 : 0), nameSize, 2)}
            x={p}
            y={h * 0.42}
            size={nameSize}
            fill={onAccent}
            weight={headingWeight}
            fontFamily={fontFamily}
            lineHeight={1.03}
          />
          <text x={p} y={h * 0.53} fill={onAccent} fillOpacity={0.9} fontSize={roleSize} fontWeight={700} fontFamily={fontFamily}>
            {contact.role}
          </text>
          <SvgLines
            lines={wrapLines(contact.tagline, w * 0.58, bodySize, 2)}
            x={p}
            y={h * 0.66}
            size={bodySize}
            fill={onAccent}
            opacity={0.78}
            fontFamily={fontFamily}
            lineHeight={1.3}
          />
          {contactList.slice(0, 2).map((line, index) => (
            <text
              key={`${line}-${index}`}
              x={p}
              y={h - p - (Math.min(contactList.length, 2) - 1 - index) * smallSize * 1.45}
              fill={onAccent}
              fillOpacity={0.9}
              fontSize={smallSize}
              fontWeight={600}
              fontFamily={fontFamily}
            >
              {line}
            </text>
          ))}
          {qr && (
            <>
              <rect x={w - p - qrSize - 1.4} y={h - p - qrSize - 1.4} width={qrSize + 2.8} height={qrSize + 2.8} rx={1} fill="#ffffff" />
              <image href={qr} x={w - p - qrSize} y={h - p - qrSize} width={qrSize} height={qrSize} />
            </>
          )}
        </>
      )}

      {template === "minimal" && (
        <>
          <line x1={p} y1={h * 0.19} x2={w - p} y2={h * 0.19} stroke={accent} strokeWidth={h * 0.012} />
          <line x1={p} y1={h * 0.81} x2={w - p} y2={h * 0.81} stroke={accent} strokeWidth={h * 0.012} />
          <SvgLines
            lines={wrapLines(contact.name, w - p * 2, nameSize * 0.95, 2)}
            x={w / 2}
            y={h * 0.45}
            size={nameSize * 0.95}
            fill={secondary}
            weight={headingWeight}
            anchor="middle"
            fontFamily={fontFamily}
            lineHeight={1.05}
          />
          <text x={w / 2} y={h * 0.56} textAnchor="middle" fill={accent} fontSize={roleSize} fontWeight={700} fontFamily={fontFamily}>
            {contact.role}
          </text>
          <text
            x={w / 2}
            y={h * 0.68}
            textAnchor="middle"
            fill={secondary}
            fillOpacity={0.65}
            fontSize={smallSize}
            fontWeight={700}
            letterSpacing={0.3}
            fontFamily={fontFamily}
          >
            {contact.company}
          </text>
          <SvgLines
            lines={wrapLines(contactList.join("  ·  "), w * 0.72, smallSize, 2)}
            x={w / 2}
            y={h * 0.75}
            size={smallSize}
            fill={secondary}
            opacity={0.75}
            anchor="middle"
            fontFamily={fontFamily}
            lineHeight={1.35}
          />
          {qr && <image href={qr} x={w / 2 - qrSize / 2} y={h - p - qrSize} width={qrSize} height={qrSize} />}
        </>
      )}

      {template === "studio" && (
        <>
          <rect width={w} height={h} fill={accent} fillOpacity={0.08} />
          <rect x={p} y={p} width={h * 0.3} height={h * 0.3} rx={1.2} fill={accent} />
          <text
            x={p + h * 0.15}
            y={p + h * 0.2}
            textAnchor="middle"
            fill={readableOn(accent)}
            fontSize={h * 0.12}
            fontWeight={800}
            fontFamily={fontFamily}
          >
            {monogram}
          </text>
          <SvgLines
            lines={wrapLines(contact.name, w - (p + h * 0.3 + 3) - p, nameSize * 0.8, 2)}
            x={p + h * 0.3 + 3}
            y={p + h * 0.14}
            size={nameSize * 0.8}
            fill={secondary}
            weight={headingWeight}
            fontFamily={fontFamily}
            lineHeight={1.05}
          />
          <text
            x={p + h * 0.3 + 3}
            y={p + h * 0.14 + nameSize * 0.8 + roleSize + 0.4}
            fill={accent}
            fontSize={roleSize}
            fontWeight={700}
            fontFamily={fontFamily}
          >
            {contact.role}
          </text>
          <SvgLines
            lines={wrapLines(contact.tagline, w * 0.55, bodySize, 2)}
            x={p}
            y={h * 0.64}
            size={bodySize}
            fill={secondary}
            opacity={0.72}
            fontFamily={fontFamily}
            lineHeight={1.35}
          />
          {contactList.map((line, index) => (
            <text
              key={`${line}-${index}`}
              x={w - p}
              y={h - p - (contactList.length - 1 - index) * smallSize * 1.5}
              textAnchor="end"
              fill={secondary}
              fontSize={smallSize}
              fontWeight={600}
              fontFamily={fontFamily}
            >
              {line}
            </text>
          ))}
          {qr && <image href={qr} x={p} y={h - p - qrSize} width={qrSize} height={qrSize} />}
        </>
      )}
    </svg>
  );
}

function CardBack({ design, svgRef }) {
  const { width: w, height: h, accent, secondary, fontFamily, contact, qr, logo, monogram, back } = design;
  const onAccent = readableOn(accent);
  const p = Math.min(w, h) * 0.085;
  const headlineSize = Math.min(h * 0.1, w * 0.07);
  const smallSize = Math.min(h * 0.048, w * 0.034);
  const qrSize = Math.min(h * 0.3, w * 0.2);
  const headingWeight = fontHeadingWeight(design.font);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Business card back preview"
    >
      <rect width={w} height={h} fill={accent} />
      {logo ? (
        <image href={logo} x={p} y={p} width={w * 0.24} height={h * 0.16} preserveAspectRatio="xMinYMin meet" />
      ) : (
        <text x={p} y={p + smallSize * 1.4} fill={onAccent} fillOpacity={0.85} fontSize={smallSize * 1.2} fontWeight={800} fontFamily={fontFamily}>
          {monogram}
        </text>
      )}
      <SvgLines
        lines={wrapLines(back.headline || contact.tagline, w - p * 2 - (qr ? qrSize + 4 : 0), headlineSize, 3)}
        x={p}
        y={h * 0.45}
        size={headlineSize}
        fill={onAccent}
        weight={headingWeight}
        fontFamily={fontFamily}
        lineHeight={1.12}
      />
      <SvgLines
        lines={wrapLines(back.note || contact.company, w - p * 2 - (qr ? qrSize + 4 : 0), smallSize, 2)}
        x={p}
        y={h * 0.7}
        size={smallSize}
        fill={onAccent}
        opacity={0.8}
        fontFamily={fontFamily}
        lineHeight={1.35}
      />
      {contact.website && (
        <text x={p} y={h - p} fill={onAccent} fillOpacity={0.9} fontSize={smallSize} fontWeight={600} fontFamily={fontFamily}>
          {contact.website}
        </text>
      )}
      {qr && (
        <>
          <rect x={w - p - qrSize - 1.4} y={h - p - qrSize - 1.4} width={qrSize + 2.8} height={qrSize + 2.8} rx={1} fill="#ffffff" />
          <image href={qr} x={w - p - qrSize} y={h - p - qrSize} width={qrSize} height={qrSize} />
        </>
      )}
      {!qr && secondary && <rect x={0} y={h - 1.4} width={w} height={1.4} fill={secondary} fillOpacity={0.4} />}
    </svg>
  );
}

function Letterhead({ design, svgRef }) {
  const { width: w, height: h, accent, secondary, fontFamily, template, contact, letter, logo } = design;
  const onAccent = readableOn(accent);
  const m = Math.min(w, h) * 0.085;
  const bodySize = Math.min(3.6, w * 0.018);
  const lineHeight = bodySize * 1.55;
  const smallSize = Math.max(2.2, bodySize * 0.78);
  const headingWeight = fontHeadingWeight(design.font);
  const contentWidth = w - m * 2;
  const bodyStart = template === "executive" ? 58 : 48;

  const recipientLines = wrapLines(letter.recipient, contentWidth * 0.62, smallSize, 4);
  let cursor = bodyStart;
  const recipientBlock = recipientLines.length ? recipientLines.length * smallSize * 1.4 + 6 : 0;
  cursor += recipientBlock;
  const subjectBlock = letter.subject ? bodySize * 1.5 + 7 : 0;
  cursor += subjectBlock;

  const bodyLines = wrapLines(letter.body, contentWidth, bodySize, 80);
  const available = h - 52 - cursor;
  const maxBodyLines = Math.max(0, Math.floor(available / lineHeight));
  const visibleBody = bodyLines.slice(0, maxBodyLines);
  const overflow = bodyLines.length > maxBodyLines;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${w} ${h}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Letterhead preview"
    >
      <rect width={w} height={h} fill="#ffffff" />

      {template === "classic" && (
        <>
          <rect width={w} height={Math.max(3, h * 0.014)} fill={accent} />
          {logo ? (
            <image href={logo} x={m} y={h * 0.045} width={w * 0.09} height={h * 0.035} preserveAspectRatio="xMinYMin meet" />
          ) : (
            <text x={m} y={h * 0.075} fill={accent} fontSize={w * 0.05} fontWeight={800} fontFamily={fontFamily}>
              {initialsOf(contact.company || contact.name)}
            </text>
          )}
          <text x={w - m} y={h * 0.058} textAnchor="end" fill={secondary} fontSize={w * 0.028} fontWeight={800} fontFamily={fontFamily}>
            {contact.company}
          </text>
          <text x={w - m} y={h * 0.074} textAnchor="end" fill={secondary} fillOpacity={0.6} fontSize={smallSize} fontFamily={fontFamily}>
            {contact.tagline}
          </text>
          <line x1={m} y1={h * 0.092} x2={w - m} y2={h * 0.092} stroke={accent} strokeOpacity={0.35} strokeWidth={0.4} />
        </>
      )}

      {template === "modern" && (
        <>
          <rect width={Math.max(7, w * 0.045)} height={h} fill={accent} />
          {logo ? (
            <image href={logo} x={m + 4} y={h * 0.05} width={w * 0.1} height={h * 0.038} preserveAspectRatio="xMinYMin meet" />
          ) : (
            <text x={m + 4} y={h * 0.08} fill={accent} fontSize={w * 0.05} fontWeight={800} fontFamily={fontFamily}>
              {initialsOf(contact.company || contact.name)}
            </text>
          )}
          <text x={m + 4} y={h * 0.088} fill={secondary} fontSize={w * 0.026} fontWeight={800} fontFamily={fontFamily}>
            {contact.company}
          </text>
          <text x={m + 4} y={h * 0.102} fill={secondary} fillOpacity={0.6} fontSize={smallSize} fontFamily={fontFamily}>
            {contact.website} · {contact.email}
          </text>
          <line x1={m + 4} y1={h * 0.118} x2={w - m} y2={h * 0.118} stroke={accent} strokeOpacity={0.3} strokeWidth={0.4} />
        </>
      )}

      {template === "minimal" && (
        <>
          <text x={w / 2} y={h * 0.075} textAnchor="middle" fill={secondary} fontSize={w * 0.032} fontWeight={800} letterSpacing={1.2} fontFamily={fontFamily}>
            {contact.company}
          </text>
          <text x={w / 2} y={h * 0.093} textAnchor="middle" fill={secondary} fillOpacity={0.6} fontSize={smallSize} fontFamily={fontFamily}>
            {[contact.phone, contact.email, contact.website].filter(Boolean).join("  ·  ")}
          </text>
          <line x1={m} y1={h * 0.108} x2={w - m} y2={h * 0.108} stroke={accent} strokeWidth={0.5} />
        </>
      )}

      {template === "executive" && (
        <>
          <rect width={w} height={h * 0.155} fill={secondary} />
          <rect y={h * 0.155} width={w} height={Math.max(1.2, h * 0.006)} fill={accent} />
          {logo ? (
            <image href={logo} x={m} y={h * 0.042} width={w * 0.09} height={h * 0.035} preserveAspectRatio="xMinYMin meet" />
          ) : (
            <text x={m} y={h * 0.075} fill="#ffffff" fontSize={w * 0.046} fontWeight={800} fontFamily={fontFamily}>
              {initialsOf(contact.company || contact.name)}
            </text>
          )}
          <text x={m} y={h * 0.108} fill="#ffffff" fontSize={w * 0.03} fontWeight={800} fontFamily={fontFamily}>
            {contact.company}
          </text>
          <text x={w - m} y={h * 0.058} textAnchor="end" fill="#ffffff" fillOpacity={0.82} fontSize={smallSize} fontFamily={fontFamily}>
            {contact.phone}
          </text>
          <text x={w - m} y={h * 0.074} textAnchor="end" fill="#ffffff" fillOpacity={0.82} fontSize={smallSize} fontFamily={fontFamily}>
            {contact.email}
          </text>
          <text x={w - m} y={h * 0.09} textAnchor="end" fill="#ffffff" fillOpacity={0.82} fontSize={smallSize} fontFamily={fontFamily}>
            {contact.website}
          </text>
        </>
      )}

      <SvgLines
        lines={recipientLines}
        x={m}
        y={bodyStart}
        size={smallSize}
        fill={secondary}
        opacity={0.75}
        fontFamily={fontFamily}
        lineHeight={1.4}
      />

      {letter.subject && (
        <text
          x={m}
          y={bodyStart + recipientBlock + bodySize}
          fill={secondary}
          fontSize={bodySize * 1.08}
          fontWeight={800}
          fontFamily={fontFamily}
        >
          {letter.subject}
        </text>
      )}

      <SvgLines
        lines={visibleBody}
        x={m}
        y={cursor + bodySize}
        size={bodySize}
        fill={secondary}
        opacity={0.88}
        fontFamily={fontFamily}
        lineHeight={lineHeight / bodySize}
      />

      {(letter.closing || letter.signature) && (
        <>
          <text x={m} y={h - 38} fill={secondary} fontSize={bodySize} fontFamily={fontFamily}>
            {letter.closing}
          </text>
          <SvgLines
            lines={wrapLines(letter.signature, contentWidth * 0.55, bodySize, 3)}
            x={m}
            y={h - 31}
            size={bodySize}
            fill={secondary}
            weight={700}
            fontFamily={fontFamily}
            lineHeight={1.35}
          />
        </>
      )}

      <rect y={h - Math.max(10, h * 0.045)} width={w} height={Math.max(10, h * 0.045)} fill={accent} />
      <text
        x={m}
        y={h - Math.max(10, h * 0.045) / 2 + smallSize * 0.35}
        fill={onAccent}
        fontSize={smallSize * 0.92}
        fontWeight={600}
        fontFamily={fontFamily}
      >
        {[contact.phone, contact.email, contact.website, contact.address].filter(Boolean).join("   ·   ")}
      </text>
      {overflow && (
        <text x={w - m} y={h - 20} textAnchor="end" fill="#b45309" fontSize={smallSize * 0.9} fontFamily={fontFamily}>
          Preview truncated — shorten the letter body
        </text>
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Export helpers                                                            */
/* -------------------------------------------------------------------------- */

function rasterizeSvg(svgElement, pxPerMm = 300 / 25.4) {
  return new Promise((resolve) => {
    if (!svgElement) {
      resolve(null);
      return;
    }
    const viewBox = svgElement.getAttribute("viewBox")?.split(/\s+/).map(Number) || [];
    const width = viewBox[2] || svgElement.clientWidth || 100;
    const height = viewBox[3] || svgElement.clientHeight || 100;
    const clone = svgElement.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    const xml = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * pxPerMm);
        canvas.height = Math.round(height * pxPerMm);
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

/* -------------------------------------------------------------------------- */
/*  Main tool                                                                 */
/* -------------------------------------------------------------------------- */

export default function BusinessIdentityStudio({ mode: requestedMode = "card" }) {
  const mode = requestedMode === "letterhead" ? "letterhead" : "card";
  const meta = MODES[mode];
  const { addRecentTool } = useRecentTools();
  const [state, setState] = useState(() => createEmptyBusinessState(mode));
  const [hydrated, setHydrated] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [logoInputKey, setLogoInputKey] = useState(0);

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const letterRef = useRef(null);
  const logoRef = useRef(null);
  const jsonRef = useRef(null);

  useEffect(() => {
    addRecentTool(meta.tool);
    const timer = window.setTimeout(() => {
      const saved = readStored(storageKey(mode), null);
      if (saved && typeof saved === "object") {
        const empty = createEmptyBusinessState(mode);
        setState({
          ...empty,
          ...saved,
          mode,
          contact: { ...empty.contact, ...(saved.contact || {}) },
          back: { ...empty.back, ...(saved.back || {}) },
          letter: { ...empty.letter, ...(saved.letter || {}) },
        });
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool, meta.tool, mode]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => writeStored(storageKey(mode), state), 500);
    return () => window.clearTimeout(timer);
  }, [state, hydrated, mode]);

  useEffect(() => {
    let cancelled = false;
    if (!state.qrEnabled || !state.qrValue.trim()) {
      const clear = window.setTimeout(() => {
        if (!cancelled) setQrImage("");
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(clear);
      };
    }
    QRCode.toDataURL(state.qrValue.trim(), {
      margin: 1,
      width: 640,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrImage(url);
      })
      .catch(() => {
        if (!cancelled) setQrImage("");
      });
    return () => {
      cancelled = true;
    };
  }, [state.qrEnabled, state.qrValue]);

  const update = (patch) => setState((current) => ({ ...current, ...patch }));
  const updateContact = (patch) =>
    setState((current) => ({ ...current, contact: { ...current.contact, ...patch } }));
  const updateBack = (patch) =>
    setState((current) => ({ ...current, back: { ...current.back, ...patch } }));
  const updateLetter = (patch) =>
    setState((current) => ({ ...current, letter: { ...current.letter, ...patch } }));

  const card = useMemo(() => cardDimensions(state), [state]);
  const sheet = sheetDimensions(state.sheetPaper);
  const letterSize = letterheadDimensions(state.letterheadSize);
  const fontFamily = fontStack(state.font);
  const accent = state.accent;
  const monogram = initialsOf(state.contact.company || state.contact.name);

  const design = {
    width: card.width,
    height: card.height,
    accent,
    secondary: state.secondary,
    font: state.font,
    fontFamily,
    template: state.cardTemplate,
    contact: state.contact,
    qr: qrImage,
    logo: state.logo,
    monogram,
    back: state.back,
  };

  const letterDesign = {
    width: letterSize.width,
    height: letterSize.height,
    accent,
    secondary: state.secondary,
    font: state.font,
    fontFamily,
    template: state.letterheadTemplate,
    contact: state.contact,
    letter: state.letter,
    logo: state.logo,
  };

  const layout = useMemo(
    () =>
      impose({
        sheetWidth: sheet.width,
        sheetHeight: sheet.height,
        itemWidth: card.width,
        itemHeight: card.height,
        gap: toNumber(state.sheetGap, 0),
        margin: toNumber(state.sheetMargin, 0),
      }),
    [sheet, card, state.sheetGap, state.sheetMargin],
  );

  const bleed = toNumber(state.bleed, 0);
  const safe = toNumber(state.safe, 0);
  const safeX = card.width ? Math.min(50, (safe / card.width) * 100) : 0;
  const safeY = card.height ? Math.min(50, (safe / card.height) * 100) : 0;

  const hasCardContent = Boolean(
    state.contact.name || state.contact.company || state.contact.email || state.contact.phone || state.logo,
  );
  const hasLetterContent = Boolean(
    state.contact.company || state.letter.body || state.letter.subject || state.contact.name,
  );

  const handleLogo = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPEG, SVG or WebP logo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Keep the logo under 2 MB so the project stays portable.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ logo: String(reader.result || ""), logoName: file.name });
    reader.onerror = () => toast.error("Could not read that logo.");
    reader.readAsDataURL(file);
  };

  const exportPng = async () => {
    const element = mode === "card" ? frontRef.current : letterRef.current;
    if (!element) return;
    const dataUrl = await rasterizeSvg(element);
    if (!dataUrl) {
      toast.error("Could not render the artwork. Try again.");
      return;
    }
    const name = mode === "card" ? "toolstrek-business-card.png" : "toolstrek-letterhead.png";
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("300 DPI PNG downloaded");
  };

  const exportPdf = async () => {
    try {
      const margin = state.cropMarks ? 5 : 0;
      const targets =
        mode === "card"
          ? [{ element: frontRef.current, width: card.width, height: card.height, label: "Front" }]
          : [{ element: letterRef.current, width: letterSize.width, height: letterSize.height, label: "Letterhead" }];

      if (mode === "card" && state.back.enabled) {
        targets.push({ element: backRef.current, width: card.width, height: card.height, label: "Back" });
      }

      let doc = null;
      for (let index = 0; index < targets.length; index += 1) {
        const target = targets[index];
        if (!target.element) continue;
        const dataUrl = await rasterizeSvg(target.element);
        if (!dataUrl) continue;
        const pageWidth = target.width + margin * 2;
        const pageHeight = target.height + margin * 2;
        if (!doc) {
          doc = new jsPDF({ unit: "mm", format: [pageWidth, pageHeight], orientation: pageWidth >= pageHeight ? "landscape" : "portrait" });
        } else {
          doc.addPage([pageWidth, pageHeight], pageWidth >= pageHeight ? "landscape" : "portrait");
        }
        doc.addImage(dataUrl, "PNG", margin, margin, target.width, target.height);
        if (margin) {
          doc.setDrawColor(120, 130, 145);
          doc.setLineWidth(0.2);
          const mark = 3.5;
          const offset = 1.2;
          const corners = [
            { x: margin, y: margin, dx: -1, dy: -1 },
            { x: margin + target.width, y: margin, dx: 1, dy: -1 },
            { x: margin, y: margin + target.height, dx: -1, dy: 1 },
            { x: margin + target.width, y: margin + target.height, dx: 1, dy: 1 },
          ];
          corners.forEach((corner) => {
            doc.line(corner.x + corner.dx * offset, corner.y, corner.x + corner.dx * (offset + mark), corner.y);
            doc.line(corner.x, corner.y + corner.dy * offset, corner.x, corner.y + corner.dy * (offset + mark));
          });
          doc.setFontSize(7);
          doc.setTextColor(130, 140, 155);
          doc.text(`ToolsTrek · ${target.label} · ${target.width.toFixed(1)} × ${target.height.toFixed(1)} mm · 300 DPI`, margin, margin + target.height + 4);
        }
      }

      if (!doc) {
        toast.error("Add some content before exporting.");
        return;
      }
      doc.save(mode === "card" ? "toolstrek-business-card.pdf" : "toolstrek-letterhead.pdf");
      toast.success("Print-ready PDF downloaded");
    } catch {
      toast.error("The PDF could not be generated. Try a smaller logo.");
    }
  };

  const exportSheetPdf = async () => {
    if (!layout.count) {
      toast.error("No cards fit on that sheet — reduce the margin or gap.");
      return;
    }
    const dataUrl = await rasterizeSvg(frontRef.current);
    if (!dataUrl) {
      toast.error("Could not render the card.");
      return;
    }
    const doc = new jsPDF({
      unit: "mm",
      format: [sheet.width, sheet.height],
      orientation: sheet.width >= sheet.height ? "landscape" : "portrait",
    });
    layout.positions.forEach((position) => {
      doc.addImage(dataUrl, "PNG", position.x, position.y, card.width, card.height);
    });
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 145);
    doc.text(
      `ToolsTrek · ${layout.count} cards on ${sheet.label} · ${card.width.toFixed(1)} × ${card.height.toFixed(1)} mm`,
      4,
      sheet.height - 3,
    );
    doc.save("toolstrek-business-card-sheet.pdf");
    toast.success(`${layout.count} cards exported on ${sheet.label}`);
  };

  const copyDetails = async () => {
    const lines = [
      state.contact.company,
      state.contact.tagline,
      "",
      state.contact.name,
      state.contact.role,
      "",
      [state.contact.phone, state.contact.email, state.contact.website].filter(Boolean).join(" · "),
      state.contact.address,
      mode === "card" && state.qrEnabled && state.qrValue ? `QR: ${state.qrValue}` : "",
    ].filter((line) => line !== undefined);
    const ok = await copyText(lines.join("\n").trim());
    if (ok) toast.success(`${mode === "card" ? "Card" : "Letterhead"} details copied`);
    else toast.error("Could not copy the details");
  };

  const exportJson = () => {
    downloadText(
      JSON.stringify(
        {
          app: `toolstrek-${mode === "card" ? "business-card" : "letterhead"}`,
          version: 1,
          exportedAt: new Date().toISOString(),
          state: { ...state, mode },
        },
        null,
        2,
      ),
      `toolstrek-${mode === "card" ? "business-card" : "letterhead"}-project.json`,
      "application/json",
    );
    toast.success("Project exported as JSON");
  };

  const importJson = async (file) => {
    const parsed = await parseJsonFile(file);
    const imported = parsed?.state || parsed;
    if (!imported || typeof imported !== "object") {
      toast.error(`That file is not a ToolsTrek ${mode === "card" ? "business card" : "letterhead"} project.`);
      return;
    }
    const empty = createEmptyBusinessState(mode);
    setState({
      ...empty,
      ...imported,
      mode,
      contact: { ...empty.contact, ...(imported.contact || {}) },
      back: { ...empty.back, ...(imported.back || {}) },
      letter: { ...empty.letter, ...(imported.letter || {}) },
    });
    toast.success("Project imported");
  };

  const loadDemo = () => {
    setState(createDemoBusinessState(mode));
    toast.success(`Demo ${mode === "card" ? "card" : "letterhead"} loaded — replace it with your own details`);
  };

  const clearAll = () => {
    setState(createEmptyBusinessState(mode));
    setLogoInputKey((key) => key + 1);
    toast.success("All content cleared");
  };

  const templateOptions = mode === "card" ? CARD_TEMPLATES : LETTERHEAD_TEMPLATES;
  const activeTemplate = mode === "card" ? state.cardTemplate : state.letterheadTemplate;

  return (
    <div className="business-maker space-y-6 pb-10">
      <style>{`.business-maker .text-xs { font-size: 13px !important; }`}</style>

      <Hero
        tone={TONE}
        eyebrow={meta.eyebrow}
        icon={mode === "card" ? BadgeCheck : FileText}
        title={meta.heroTitle}
        description={meta.heroDescription}
        badges={meta.badges}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <SectionCard
            icon={Type}
            tone={TONE}
            title="1 · Brand identity"
            description="Everything here is editable. Nothing is sent anywhere — the preview updates as you type."
            actions={<Chip tone={TONE}>{monogram}</Chip>}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    type="text"
                    value={state.contact.name}
                    onChange={(event) => updateContact({ name: event.target.value })}
                    placeholder="e.g. Ayesha Rahman"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Role / title">
                  <input
                    type="text"
                    value={state.contact.role}
                    onChange={(event) => updateContact({ role: event.target.value })}
                    placeholder="e.g. Brand & Product Designer"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Company / studio">
                  <input
                    type="text"
                    value={state.contact.company}
                    onChange={(event) => updateContact({ company: event.target.value })}
                    placeholder="e.g. Northline Studio"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Tagline" hint="One short line that explains what you do.">
                  <input
                    type="text"
                    value={state.contact.tagline}
                    onChange={(event) => updateContact({ tagline: event.target.value })}
                    placeholder="e.g. Identity systems that feel effortless"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    value={state.contact.phone}
                    onChange={(event) => updateContact({ phone: event.target.value })}
                    placeholder="e.g. +1 (415) 555-0134"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={state.contact.email}
                    onChange={(event) => updateContact({ email: event.target.value })}
                    placeholder="e.g. hello@studio.com"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Website">
                  <input
                    type="text"
                    value={state.contact.website}
                    onChange={(event) => updateContact({ website: event.target.value })}
                    placeholder="e.g. studio.com"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field
                  label="Address"
                  hint={mode === "card" ? "Shown in exports and the contact block." : "Shown on the letterhead and in exports."}
                >
                  <input
                    type="text"
                    value={state.contact.address}
                    onChange={(event) => updateContact({ address: event.target.value })}
                    placeholder="e.g. 18 Mercer Street, New York"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
              </div>

              <Field
                label="Services / specialties"
                hint={
                  mode === "card"
                    ? "One per line. Used on the card back."
                    : "One per line. Used as reference for the letterhead."
                }
              >
                <textarea
                  rows={4}
                  value={state.contact.services}
                  onChange={(event) => updateContact({ services: event.target.value })}
                  placeholder={"Brand strategy\nVisual identity\nPackaging"}
                  className={fieldClass(false, TONE)}
                />
              </Field>

              <div>
                <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">Logo</p>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700">
                    {state.logo ? (
                      <img src={state.logo} alt="Uploaded logo" className="max-h-14 max-w-20 object-contain" />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton tone={TONE} icon={Upload} onClick={() => logoRef.current?.click()}>
                        Upload logo
                      </ActionButton>
                      {state.logo && (
                        <ActionButton
                          tone="rose"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => {
                            update({ logo: "", logoName: "" });
                            setLogoInputKey((key) => key + 1);
                          }}
                        >
                          Remove
                        </ActionButton>
                      )}
                    </div>
                    <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                      {state.logoName || "PNG, SVG, JPEG or WebP up to 2 MB. Transparent PNG or SVG works best."}
                    </p>
                  </div>
                  <input
                    key={logoInputKey}
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleLogo(file);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <ActionButton tone={TONE} variant="primary" icon={Wand2} onClick={loadDemo}>
                  Load demo data
                </ActionButton>
                <ActionButton tone={TONE} icon={RotateCcw} onClick={clearAll}>
                  Clear all
                </ActionButton>
                <ActionButton tone={TONE} icon={FileJson} onClick={exportJson}>
                  Export project
                </ActionButton>
                <ActionButton tone={TONE} icon={Upload} onClick={() => jsonRef.current?.click()}>
                  Import project
                </ActionButton>
                <input
                  ref={jsonRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) importJson(file);
                    event.target.value = "";
                  }}
                />
                <span className="text-[13px] font-medium text-slate-400">Nothing is pre-filled by default.</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Palette}
            tone={TONE}
            title="2 · Design & typography"
            description="Pick a layout, a brand colour and a type voice. The monogram is generated from your company name."
            actions={<Chip tone={TONE}>{state.font}</Chip>}
          >
            <div className="space-y-5">
              <div>
                <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {mode === "card" ? "Card layout" : "Letterhead layout"}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {templateOptions.map((template) => {
                    const active = activeTemplate === template.value;
                    return (
                      <button
                        key={template.value}
                        type="button"
                        onClick={() =>
                          update(mode === "card" ? { cardTemplate: template.value } : { letterheadTemplate: template.value })
                        }
                        aria-pressed={active}
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40"
                            : "border-slate-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-violet-700"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{template.label}</span>
                          {active && <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-slate-500 dark:text-slate-400">
                          {template.blurb}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
                  {(templateOptions.find((item) => item.value === activeTemplate) || {}).description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Brand colour">
                  <div className="flex flex-wrap items-center gap-2">
                    {BRAND_COLOURS.map((colour) => (
                      <button
                        key={colour.value}
                        type="button"
                        onClick={() => update({ accent: colour.value })}
                        aria-label={colour.label}
                        aria-pressed={state.accent === colour.value}
                        className={`h-8 w-8 rounded-full border-2 transition ${
                          state.accent === colour.value
                            ? "border-slate-900 dark:border-white"
                            : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                        style={{ backgroundColor: colour.value }}
                      />
                    ))}
                    <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                      Custom
                      <input
                        type="color"
                        value={state.accent}
                        onChange={(event) => update({ accent: event.target.value })}
                        className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                        aria-label="Custom brand colour"
                      />
                    </label>
                  </div>
                </Field>

                <Field label="Ink colour" hint="Body text and secondary details.">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={state.secondary}
                      onChange={(event) => update({ secondary: event.target.value })}
                      className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-0.5 dark:border-slate-700"
                      aria-label="Ink colour"
                    />
                    <span className="text-[13px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                      {state.secondary.toUpperCase()}
                    </span>
                  </div>
                </Field>
              </div>

              <Segmented
                label="Typeface"
                tone={TONE}
                value={state.font}
                options={FONT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                onChange={(value) => update({ font: value })}
                columns={4}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Scissors}
            tone={TONE}
            title="3 · Print setup"
            description="Choose a standard size or enter your own. Bleed and safe areas are shown on the preview."
            actions={<Chip tone={TONE}>{state.cropMarks ? "Crop marks on" : "Crop marks off"}</Chip>}
          >
            <div className="space-y-5">
              {mode === "card" ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Card size">
                      <select
                        value={state.cardSize}
                        onChange={(event) => update({ cardSize: event.target.value })}
                        className={fieldClass(false, TONE)}
                      >
                        {CARD_SIZES.map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.label} — {size.note}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Width (mm)">
                        <input
                          type="number"
                          min="30"
                          max="200"
                          step="0.1"
                          value={state.cardSize === "custom" ? state.customWidth : card.width}
                          disabled={state.cardSize !== "custom"}
                          onChange={(event) => update({ customWidth: event.target.value })}
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="Height (mm)">
                        <input
                          type="number"
                          min="20"
                          max="200"
                          step="0.1"
                          value={state.cardSize === "custom" ? state.customHeight : card.height}
                          disabled={state.cardSize !== "custom"}
                          onChange={(event) => update({ customHeight: event.target.value })}
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <SliderRow
                      label="Bleed"
                      value={bleed}
                      min={0}
                      max={8}
                      step={0.5}
                      tone={TONE}
                      onChange={(value) => update({ bleed: String(value) })}
                      format={(value) => `${value} mm`}
                      hint="3 mm is the commercial standard. Export at trim size and let the printer add its bleed."
                    />
                    <SliderRow
                      label="Safe margin"
                      value={safe}
                      min={0}
                      max={10}
                      step={0.5}
                      tone={TONE}
                      onChange={(value) => update({ safe: String(value) })}
                      format={(value) => `${value} mm`}
                      hint="Keep text and the logo inside this dashed boundary."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ToggleRow
                      tone={TONE}
                      checked={state.cropMarks}
                      onChange={(checked) => update({ cropMarks: checked })}
                      label="Add crop marks to the PDF"
                      description="Adds a small margin and corner marks so a print shop can trim accurately."
                    />
                    <ToggleRow
                      tone={TONE}
                      checked={state.showGuides}
                      onChange={(checked) => update({ showGuides: checked })}
                      label="Show trim and safe guides"
                      description="Guides are on-screen only and never appear in exports."
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Sheet imposition</p>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400">
                          How many cards fit on one sheet with your margin and gap.
                        </p>
                      </div>
                      <Chip tone={layout.count ? "emerald" : "amber"}>
                        {layout.count ? `${layout.count} per sheet` : "No fit"}
                      </Chip>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Field label="Sheet">
                        <select
                          value={state.sheetPaper}
                          onChange={(event) => update({ sheetPaper: event.target.value })}
                          className={fieldClass(false, TONE)}
                        >
                          {SHEET_SIZES.map((size) => (
                            <option key={size.id} value={size.id}>
                              {size.label} — {size.width} × {size.height} mm
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Sheet margin (mm)">
                        <input
                          type="number"
                          min="0"
                          max="40"
                          step="0.5"
                          value={state.sheetMargin}
                          onChange={(event) => update({ sheetMargin: event.target.value })}
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="Gap between cards (mm)">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={state.sheetGap}
                          onChange={(event) => update({ sheetGap: event.target.value })}
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                    </div>
                    {layout.count > 0 && (
                      <div className="mt-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-800/50">
                        <svg viewBox={`0 0 ${sheet.width} ${sheet.height}`} className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="Business card imposition preview">
                          <rect x="0" y="0" width={sheet.width} height={sheet.height} fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
                          {layout.positions.map((position, index) => (
                            <rect
                              key={index}
                              x={position.x}
                              y={position.y}
                              width={card.width}
                              height={card.height}
                              fill="#ede9fe"
                              stroke="#8b5cf6"
                              strokeWidth="0.35"
                              rx="0.5"
                            />
                          ))}
                        </svg>
                        <p className="mt-2 text-center text-[13px] text-slate-500 dark:text-slate-400">
                          {layout.columns} × {layout.rows} grid · {layout.utilisation.toFixed(0)}% of the sheet used
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ToggleRow
                      tone={TONE}
                      checked={state.back.enabled}
                      onChange={(checked) => updateBack({ enabled: checked })}
                      label="Design a card back"
                      description="Adds a second page to the PDF and a back preview."
                    />
                    <div className="grid grid-cols-1 gap-3">
                      <Field label="QR code destination" hint="URL, email, phone or any short text.">
                        <input
                          type="text"
                          value={state.qrValue}
                          onChange={(event) => update({ qrValue: event.target.value })}
                          placeholder="e.g. https://studio.com"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <ToggleRow
                        tone={TONE}
                        checked={state.qrEnabled}
                        onChange={(checked) => update({ qrEnabled: checked })}
                        label="Show QR code"
                        description="Generated locally at high resolution for print."
                      />
                    </div>
                  </div>

                  {state.back.enabled && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Back headline">
                        <input
                          type="text"
                          value={state.back.headline}
                          onChange={(event) => updateBack({ headline: event.target.value })}
                          placeholder="e.g. Let's build something clear."
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="Back note">
                        <input
                          type="text"
                          value={state.back.note}
                          onChange={(event) => updateBack({ note: event.target.value })}
                          placeholder="e.g. Book a call at studio.com/call"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <Field label="Letterhead paper size">
                    <select
                      value={state.letterheadSize}
                      onChange={(event) => update({ letterheadSize: event.target.value })}
                      className={fieldClass(false, TONE)}
                    >
                      {LETTERHEAD_SIZES.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Callout tone={TONE} variant="tip" title="Matching stationery">
                    Keep the colour, typeface and logo treatment consistent with the card, but choose a letterhead
                    layout with room for long copy and a handwritten-style signature.
                  </Callout>
                </div>
              )}
            </div>
          </SectionCard>

          {mode === "letterhead" && (
            <SectionCard
              icon={FileText}
              tone={TONE}
              title="4 · Letter content"
              description="Write the recipient block, subject, body and sign-off. The preview shows exactly what exports."
              actions={<Chip tone={TONE}>{letterSize.width} × {letterSize.height} mm</Chip>}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Recipient block" hint="One line per row. Leave blank for a generic letterhead.">
                    <textarea
                      rows={4}
                      value={state.letter.recipient}
                      onChange={(event) => updateLetter({ recipient: event.target.value })}
                      placeholder={"Ms. Clara Mendes\nMeridian Coffee\n42 Harbour Lane\nPortland, OR 97209"}
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                  <div className="space-y-4">
                    <Field label="Subject">
                      <input
                        type="text"
                        value={state.letter.subject}
                        onChange={(event) => updateLetter({ subject: event.target.value })}
                        placeholder="e.g. Proposal: Brand refresh"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="Closing">
                      <input
                        type="text"
                        value={state.letter.closing}
                        onChange={(event) => updateLetter({ closing: event.target.value })}
                        placeholder="e.g. Warm regards,"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="Signature" hint="Name on the first line, title on the second.">
                      <textarea
                        rows={2}
                        value={state.letter.signature}
                        onChange={(event) => updateLetter({ signature: event.target.value })}
                        placeholder={"Ayesha Rahman\nFounder & Design Director"}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                  </div>
                </div>
                <Field label="Letter body" hint="The preview truncates gracefully; keep long letters to one page.">
                  <textarea
                    rows={10}
                    value={state.letter.body}
                    onChange={(event) => updateLetter({ body: event.target.value })}
                    placeholder="Write your letter here…"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-24">
            <SectionCard
              icon={mode === "card" ? QrCode : FileText}
              tone={TONE}
              title={mode === "card" ? "Live card preview" : "Live letterhead preview"}
              description="Exports render at 300 DPI. Guides are preview-only."
              actions={<Chip tone={TONE}>{mode === "card" ? `${card.width.toFixed(1)} × ${card.height.toFixed(1)} mm` : letterSize.label.split(" — ")[0]}</Chip>}
            >
              {mode === "card" ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
                    <CardFront design={design} svgRef={frontRef} />
                    {state.showGuides && (
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 border border-violet-500/40" />
                        <div
                          className="absolute border border-dashed border-emerald-500/70"
                          style={{ left: `${safeX}%`, right: `${safeX}%`, top: `${safeY}%`, bottom: `${safeY}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Front</span>
                    <span>·</span>
                    <span>{bleed} mm bleed</span>
                    <span>·</span>
                    <span>{safe} mm safe area</span>
                    <span>·</span>
                    <span>{qrImage ? "QR ready" : "No QR"}</span>
                  </div>

                  {state.back.enabled && (
                    <>
                      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
                        <CardBack design={design} svgRef={backRef} />
                      </div>
                      <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Back</p>
                    </>
                  )}

                  {!hasCardContent && (
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      The card is blank. Add your details, or load the demo data to explore every template.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
                    <Letterhead design={letterDesign} svgRef={letterRef} />
                  </div>
                  {!hasLetterContent && (
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      The letterhead is blank. Add your company details and letter copy, or load the demo data.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton tone={TONE} variant="primary" icon={Download} onClick={exportPng}>
                  PNG
                </ActionButton>
                <ActionButton tone={TONE} icon={FileText} onClick={exportPdf}>
                  PDF
                </ActionButton>
                {mode === "card" && (
                  <ActionButton tone={TONE} icon={Layers} onClick={exportSheetPdf} disabled={!layout.count}>
                    Sheet PDF
                  </ActionButton>
                )}
                <ActionButton tone={TONE} icon={Copy} onClick={copyDetails}>
                  Copy details
                </ActionButton>
                <ActionButton tone={TONE} icon={Printer} onClick={() => window.print()}>
                  Print
                </ActionButton>
              </div>
            </SectionCard>

            <SectionCard icon={ShieldCheck} tone={TONE} title="Print checklist">
              <div className="grid grid-cols-2 gap-2">
                <Stat tone={TONE} label="Bleed" value={`${bleed} mm`} hint="3 mm recommended" />
                <Stat tone={TONE} label="Safe area" value={`${safe} mm`} hint="Text stays inside" />
                {mode === "card" ? (
                  <Stat tone={TONE} label="Cards / sheet" value={layout.count || "—"} hint={`${sheet.label} sheet`} />
                ) : (
                  <Stat
                    tone={TONE}
                    label="Paper size"
                    value={letterSize.label.split(" — ")[0]}
                    hint={`${letterSize.width} × ${letterSize.height} mm`}
                  />
                )}
                <Stat tone={TONE} label="Export DPI" value="300" hint="Print resolution" />
              </div>
              <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  Colours on screen are RGB; ask your printer about CMYK conversion.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  {mode === "card"
                    ? "Test-scan the QR code from the exported PNG before ordering."
                    : "Keep at least 15–20 mm clear for body copy and a signature."}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  Use a vector or high-resolution logo — never a screenshot.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  Let backgrounds run into the bleed; keep type in the safe area.
                </li>
              </ul>
              <Callout tone="amber" variant="warning" className="mt-3">
                PDF pages are exported at trim size with optional crop marks. Confirm the printer&apos;s bleed and colour
                profile before a production run.
              </Callout>
            </SectionCard>

            <SectionCard icon={Sparkles} tone={TONE} title="Design notes">
              <div className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Contrast:</strong> reversed type automatically switches between white and ink based on the
                  brand colour&apos;s luminance.
                </p>
                <p>
                  <strong>Type scale:</strong>{" "}
                  {mode === "card"
                    ? "the preview scales all type from the card dimensions, so a square or slim card stays balanced."
                    : "the preview scales type from the paper size, so A4, US Letter and A5 all keep readable proportions."}
                </p>
                <p>
                  {mode === "card" ? (
                    <>
                      <strong>QR placement:</strong> the code is generated locally at 640 px and embedded in the PNG and
                      PDF at full resolution.
                    </>
                  ) : (
                    <>
                      <strong>Body copy:</strong> the preview wraps your letter text to the safe area and truncates
                      gracefully when it runs past one page.
                    </>
                  )}
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <FaqAccordion tone={TONE} items={meta.faqs} title={meta.faqTitle} />
    </div>
  );
}
