"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  Check,
  CheckCircle2,
  Contrast,
  Download,
  Eye,
  Info,
  Palette,
  Pipette,
  RotateCcw,
  Sparkles,
  SwatchBook,
  Target,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  COLOR_CONTRAST_FAQS,
  COLOR_VISION_TYPES,
  PRESET_PAIRS,
  apcaContrast,
  apcaUsage,
  contrastRatio,
  copyValuePair,
  formatRatio,
  gradeFor,
  isLargeText,
  luminanceLadder,
  parseColor,
  readableTextOn,
  relativeLuminance,
  simulateColorVision,
  suggestBackground,
  suggestForeground,
  toHex,
  toHslString,
  toRgbString,
  wcagChecklist,
} from "./contrastData";
import {
  ActionButton,
  Callout,
  Chip,
  CopyButton,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  SliderRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText } from "../_shared/toolkit/toolUtils";

const TOOL_META = {
  title: "Color Contrast Checker",
  link: "/tools/color-contrast-checker",
  icon: "Contrast",
};

const TONE = "violet";

const TABS = [
  { value: "checker", label: "Checker", icon: Contrast },
  { value: "fix", label: "Fix & vision", icon: Palette },
  { value: "learn", label: "Learn", icon: BookOpen },
];

const emptySubscribe = () => () => {};
const getIsClient = () => true;
const getIsServer = () => false;

const FALLBACK = { r: 0, g: 0, b: 0, a: 1 };

function ColorInput({ label, value, onChange, color, onPick, canEyeDrop, hint }) {
  const pickerValue = color ? toHex(color) : "#000000";
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
        {canEyeDrop && (
          <button
            type="button"
            onClick={onPick}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-700 dark:hover:text-violet-300"
          >
            <Pipette className="h-3.5 w-3.5" /> Pick
          </button>
        )}
      </div>
      <div className="flex items-stretch gap-3">
        <label
          className="relative block h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-300 shadow-sm dark:border-slate-600"
          style={{ backgroundColor: pickerValue }}
          title="Open the color picker"
        >
          <input
            type="color"
            value={pickerValue}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${label} color picker`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <div className="min-w-0 flex-1">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            aria-label={label}
            placeholder="#000000"
            className={`${fieldClass(false, TONE)} font-mono text-base font-bold uppercase`}
          />
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {color ? `${toRgbString(color)} · ${toHslString(color)}` : hint}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContrastPreview({ fg, bg, fontSize, fontWeight, label }) {
  return (
    <div
      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
      style={{ backgroundColor: toHex(bg), color: toHex(fg) }}
    >
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-1 font-black leading-tight" style={{ fontSize: `${fontSize}px`, fontWeight }}>
        The quick brown fox jumps over the lazy dog
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ fontSize: "14px" }}>
        Normal body copy at 14px. This is the size where contrast matters most for long reading sessions.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-bold"
          style={{ borderColor: toHex(fg), color: toHex(fg) }}
        >
          Button label
        </span>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: toHex(fg), color: toHex(bg) }}
        >
          <Check className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function SuggestionCard({ title, suggestion, onApply }) {
  if (!suggestion) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No adjustment reaches this target.</p>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onApply(suggestion.hex)}
      className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800 dark:hover:bg-violet-950/20"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</p>
        <span
          className="h-6 w-6 rounded-md border border-slate-200 dark:border-slate-700"
          style={{ backgroundColor: suggestion.hex }}
        />
      </div>
      <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">{suggestion.hex}</p>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        {formatRatio(suggestion.ratio)} · click to apply
      </p>
    </button>
  );
}

export default function ColorContrastChecker() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("checker");
  const [fgInput, setFgInput] = useState("#334155");
  const [bgInput, setBgInput] = useState("#f8fafc");
  const [fontSize, setFontSize] = useState(18);
  const [fontWeight, setFontWeight] = useState(400);
  const [target, setTarget] = useState(4.5);
  const [showVision, setShowVision] = useState(true);
  const [showLadder, setShowLadder] = useState(true);

  const isClient = useSyncExternalStore(emptySubscribe, getIsClient, getIsServer);
  const canEyeDrop = isClient && typeof window !== "undefined" && "EyeDropper" in window;

  const fg = parseColor(fgInput);
  const bg = parseColor(bgInput);
  const valid = Boolean(fg && bg);
  const foreground = fg || FALLBACK;
  const background = bg || { r: 255, g: 255, b: 255, a: 1 };
  const ratio = valid ? contrastRatio(foreground, background) : null;
  const large = isLargeText(fontSize, fontWeight);
  const grade = ratio ? gradeFor(ratio, large) : null;
  const apca = valid ? apcaContrast(foreground, background) : 0;
  const apcaInfo = apcaUsage(apca);
  const checklist = ratio ? wcagChecklist(ratio, large) : [];
  const foregroundSuggestions = valid ? suggestForeground(foreground, background, target) : null;
  const backgroundSuggestion = valid ? suggestBackground(foreground, background, target) : null;
  const readable = valid ? readableTextOn(background) : null;

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const pickColor = async (setter) => {
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setter(result.sRGBHex);
      toast.success(`Picked ${result.sRGBHex}.`);
    } catch {
      // The user pressed Escape or the browser refused the request.
    }
  };

  const swap = () => {
    setFgInput(bgInput);
    setBgInput(fgInput);
    toast.success("Foreground and background swapped.");
  };

  const reset = () => {
    setFgInput("#334155");
    setBgInput("#f8fafc");
    setFontSize(18);
    setFontWeight(400);
    setTarget(4.5);
    toast.success("Contrast checker reset.");
  };

  const copyReport = () => {
    if (!valid) {
      toast.error("Fix the color values before copying a report.");
      return;
    }
    const report = [
      "ToolsTrek Color Contrast Report",
      `Foreground: ${toHex(foreground)} · ${toRgbString(foreground)} · ${toHslString(foreground)}`,
      `Background: ${toHex(background)} · ${toRgbString(background)} · ${toHslString(background)}`,
      `WCAG contrast: ${formatRatio(ratio)}`,
      `Grade: ${grade.label} — ${grade.detail}`,
      `APCA Lc: ${apca.toFixed(1)} (${apcaInfo.label})`,
      `Relative luminance (foreground): ${relativeLuminance(foreground).toFixed(4)}`,
      `Relative luminance (background): ${relativeLuminance(background).toFixed(4)}`,
      "",
      ...checklist.map((item) => `${item.pass ? "PASS" : "FAIL"} · ${item.label} (needs ${item.threshold}:1)`),
    ].join("\n");
    downloadText(report, "color-contrast-report.txt");
    toast.success("Contrast report downloaded.");
  };

  const applySuggestion = (hex) => {
    setFgInput(hex);
    toast.success(`Foreground updated to ${hex}.`);
  };

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Accessibility color lab"
        icon={Contrast}
        title="Color Contrast Checker"
        description="Test any text and background pair against WCAG 2.2 AA and AAA, preview real interface text, score APCA contrast, simulate color-vision deficiency and generate accessible color fixes without leaving your browser."
        badges={[
          "WCAG 2.2 AA & AAA",
          "APCA Lc score",
          "Automatic fixes",
          "Color-vision simulation",
          "Live text preview",
          "Hex · RGB · HSL",
        ]}
      />

      <div
        role="tablist"
        aria-label="Color contrast sections"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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

      {tab === "checker" && (
        <>
          <SectionCard
            tone={TONE}
            icon={SwatchBook}
            title="Foreground and background"
            description="Pick colors, type any CSS color value, or eyedrop directly from your screen."
            actions={
              <>
                <ActionButton icon={ArrowLeftRight} onClick={swap}>
                  Swap
                </ActionButton>
                <ActionButton icon={RotateCcw} variant="ghost" onClick={reset}>
                  Reset
                </ActionButton>
              </>
            }
          >
            <div className="grid items-start gap-4 lg:grid-cols-2">
              <ColorInput
                label="Foreground / text"
                value={fgInput}
                onChange={setFgInput}
                color={fg}
                onPick={() => pickColor(setFgInput)}
                canEyeDrop={canEyeDrop}
                hint="Hex, rgb() or hsl()"
              />
              <ColorInput
                label="Background"
                value={bgInput}
                onChange={setBgInput}
                color={bg}
                onPick={() => pickColor(setBgInput)}
                canEyeDrop={canEyeDrop}
                hint="Hex, rgb() or hsl()"
              />
            </div>

            {!valid && (
              <div className="mt-3">
                <Callout tone="amber" variant="warning" title="Check the color values">
                  {!fg && <span>Foreground is not valid. </span>}
                  {!bg && <span>Background is not valid. </span>}
                  Use a hex value such as #1e293b, an rgb() value, an hsl() value or a named color.
                </Callout>
              </div>
            )}

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Presets:</span>
                {PRESET_PAIRS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFgInput(preset.fg);
                      setBgInput(preset.bg);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-violet-800 dark:hover:bg-violet-950/40 dark:hover:text-violet-300"
                  >
                    <span className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: preset.fg }} />
                    <span className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: preset.bg }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-7">
              <SectionCard
                tone={grade?.tone || TONE}
                icon={Contrast}
                title="Contrast result"
                description="WCAG 2.2 ratio for the selected pair at the current text size and weight."
                actions={
                  <>
                    <CopyButton text={copyValuePair(foreground, background)} tone={TONE} label="Copy CSS" />
                    <ActionButton icon={Download} onClick={copyReport}>
                      Report
                    </ActionButton>
                  </>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">WCAG contrast ratio</p>
                    <p className="mt-1 text-4xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
                      {ratio ? formatRatio(ratio) : "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {grade && <Chip tone={grade.tone}>{grade.label}</Chip>}
                      <Chip tone={large ? "amber" : "sky"}>{large ? "large text" : "normal text"}</Chip>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {grade ? grade.detail : "Enter two valid colors to see the score."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">APCA Lc</p>
                    <p className="mt-1 text-4xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
                      {valid ? apca.toFixed(1) : "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip tone={apcaInfo.tone}>{apcaInfo.label}</Chip>
                      <Chip tone="sky">{apca < 0 ? "light on dark" : "dark on light"}</Chip>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{apcaInfo.detail}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {checklist.map((item) => (
                    <div
                      key={item.key}
                      className={`rounded-xl border p-3 ${
                        item.pass
                          ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                          : "border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.label}</p>
                        {item.pass ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        needs {item.threshold}:1 {item.pass ? "· pass" : "· fail"}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Eye} title="Live preview" description="The same pair applied to real interface elements at 14px and at your selected size.">
                <ContrastPreview
                  fg={foreground}
                  bg={background}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  label={`${toHex(foreground)} on ${toHex(background)}`}
                />
              </SectionCard>
            </div>

            <div className="space-y-6 xl:col-span-5">
              <SectionCard tone={TONE} icon={Target} title="Text requirements" description="Size and weight decide whether the large-text thresholds apply.">
                <div className="space-y-4">
                  <SliderRow
                    tone={TONE}
                    label="Preview font size"
                    min={12}
                    max={48}
                    step={1}
                    value={fontSize}
                    onChange={setFontSize}
                    format={(value) => `${value}px`}
                    hint="WCAG treats 24px regular or 18.66px bold as large text."
                    onReset={() => setFontSize(18)}
                  />
                  <Field label="Font weight" htmlFor="contrast-weight" hint="700 and above counts as bold">
                    <select
                      id="contrast-weight"
                      value={fontWeight}
                      onChange={(event) => setFontWeight(Number(event.target.value))}
                      className={fieldClass(false, TONE)}
                    >
                      <option value={400}>400 — regular</option>
                      <option value={500}>500 — medium</option>
                      <option value={600}>600 — semibold</option>
                      <option value={700}>700 — bold</option>
                      <option value={800}>800 — extrabold</option>
                    </select>
                  </Field>
                  <div className={`rounded-xl border p-3 ${large ? "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20" : "border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20"}`}>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {large ? "Large text thresholds apply" : "Normal text thresholds apply"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {large
                        ? "AA needs 3:1 and AAA needs 4.5:1."
                        : "AA needs 4.5:1 and AAA needs 7:1."}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Info} title="Color details">
                <div className="space-y-3">
                  {[
                    { label: "Foreground", color: foreground },
                    { label: "Background", color: background },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</p>
                        <span className="h-6 w-10 rounded-md border border-slate-200 dark:border-slate-700" style={{ backgroundColor: toHex(item.color) }} />
                      </div>
                      <div className="mt-2 grid gap-1 font-mono text-sm text-slate-600 dark:text-slate-300">
                        <p>{toHex(item.color)}</p>
                        <p>{toRgbString(item.color)}</p>
                        <p>{toHslString(item.color)}</p>
                        <p className="text-slate-400 dark:text-slate-500">
                          luminance {relativeLuminance(item.color).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {readable && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Best text on this background</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {readable.hex} at {formatRatio(readable.ratio)}
                      </p>
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Sparkles} title="Quick accessibility tips">
                <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  <li>• Aim for 4.5:1 for body text and 3:1 for large text.</li>
                  <li>• Borders and icons also need 3:1 against their surroundings.</li>
                  <li>• Never use color alone to communicate meaning.</li>
                  <li>• Check focus rings and disabled states separately.</li>
                  <li>• Test the final design in both light and dark mode.</li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "fix" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={Target}
            title="Find an accessible color"
            description="Choose a target ratio. The tool changes only lightness, keeping the hue and saturation of your palette."
            actions={
              <ActionButton icon={RotateCcw} variant="ghost" onClick={() => setTarget(4.5)}>
                Reset target
              </ActionButton>
            }
          >
            <SliderRow
              tone={TONE}
              label="Target contrast ratio"
              min={3}
              max={21}
              step={0.5}
              value={target}
              onChange={setTarget}
              format={(value) => `${value.toFixed(1)}:1`}
              hint="Use 4.5:1 for normal text, 7:1 for AAA, or 3:1 for large text and UI components."
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Adjust foreground · current {ratio ? formatRatio(ratio) : "—"}
                </p>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <SuggestionCard title="Closest" suggestion={foregroundSuggestions?.nearest} onApply={applySuggestion} />
                  <SuggestionCard title="Darker" suggestion={foregroundSuggestions?.darker} onApply={applySuggestion} />
                  <SuggestionCard title="Lighter" suggestion={foregroundSuggestions?.lighter} onApply={applySuggestion} />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Adjust background · nearest match
                </p>
                <SuggestionCard
                  title="Accessible background"
                  suggestion={backgroundSuggestion}
                  onApply={(hex) => {
                    setBgInput(hex);
                    toast.success(`Background updated to ${hex}.`);
                  }}
                />
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
                  Suggestions preserve hue and saturation. If no lightness reaches the target, try a different hue or
                  reduce the target.
                </div>
              </div>
            </div>
          </SectionCard>

          {showVision && (
            <SectionCard
              tone={TONE}
              icon={Eye}
              title="Color-vision simulation"
              description="Approximate how the pair looks with protanopia, deuteranopia and tritanopia (Machado 2009)."
              actions={
                <ActionButton icon={X} variant="ghost" onClick={() => setShowVision(false)}>
                  Hide
                </ActionButton>
              }
            >
              <div className="grid gap-4 lg:grid-cols-3">
                {COLOR_VISION_TYPES.map((type) => {
                  const simulatedFg = simulateColorVision(foreground, type.value);
                  const simulatedBg = simulateColorVision(background, type.value);
                  const simulatedRatio = contrastRatio(simulatedFg, simulatedBg);
                  return (
                    <div key={type.value} className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{type.label}</p>
                        <Chip tone={simulatedRatio >= 4.5 ? "emerald" : simulatedRatio >= 3 ? "amber" : "rose"}>
                          {formatRatio(simulatedRatio)}
                        </Chip>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{type.detail}</p>
                      <div
                        className="mt-3 rounded-xl p-3"
                        style={{ backgroundColor: toHex(simulatedBg), color: toHex(simulatedFg) }}
                      >
                        <p className="text-base font-bold">Readable text sample</p>
                        <p className="mt-1 text-sm">Body copy at 14px on the simulated background.</p>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-center font-mono text-sm dark:border-slate-700">
                          {toHex(simulatedFg)}
                        </span>
                        <span className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-center font-mono text-sm dark:border-slate-700">
                          {toHex(simulatedBg)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Simulation is a guide, not a replacement for testing with assistive technology and real users.
              </p>
            </SectionCard>
          )}

          {!showVision && (
            <ActionButton icon={Eye} onClick={() => setShowVision(true)}>
              Show color-vision simulation
            </ActionButton>
          )}

          {showLadder && (
            <SectionCard
              tone={TONE}
              icon={Palette}
              title="Background luminance ladder"
              description="The same hue at 10% lightness steps, with the current foreground. Use it to find a safe surface shade."
              actions={
                <ActionButton icon={X} variant="ghost" onClick={() => setShowLadder(false)}>
                  Hide
                </ActionButton>
              }
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {luminanceLadder(background).map((hex, index) => {
                  const shade = parseColor(hex);
                  const shadeRatio = shade ? contrastRatio(foreground, shade) : 0;
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setBgInput(hex)}
                      className="rounded-xl border border-slate-200 p-3 text-left transition hover:scale-[1.02] dark:border-slate-700"
                      style={{ backgroundColor: hex, color: toHex(foreground) }}
                      title={`Apply ${hex}`}
                    >
                      <p className="text-sm font-black">{index * 10}%</p>
                      <p className="mt-6 font-mono text-sm">{hex}</p>
                      <p className="text-sm font-bold">{formatRatio(shadeRatio)}</p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {!showLadder && (
            <ActionButton icon={Palette} onClick={() => setShowLadder(true)}>
              Show luminance ladder
            </ActionButton>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard tone={TONE} icon={Info} title="Current CSS variables">
              <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
                {copyValuePair(foreground, background)}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={copyValuePair(foreground, background)} tone={TONE} label="Copy CSS variables" />
                <CopyButton text={`background-color: ${toHex(background)}; color: ${toHex(foreground)};`} tone={TONE} label="Copy declaration" />
              </div>
            </SectionCard>

            <SectionCard tone={TONE} icon={Contrast} title="Ratio reference">
              <div className="space-y-2">
                {[
                  ["21:1", "Black on white — maximum"],
                  ["7:1", "WCAG AAA normal text"],
                  ["4.5:1", "WCAG AA normal text"],
                  ["3:1", "WCAG AA large text & UI"],
                  ["1:1", "No contrast — invisible"],
                ].map(([value, label]) => (
                  <div key={value} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
                    <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white">{value}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone={TONE} icon={Contrast} title="WCAG 2.2 formula">
              <div className="rounded-xl bg-slate-900 p-4 text-center font-mono text-sm leading-relaxed text-violet-300 dark:bg-slate-950">
                (L1 + 0.05) / (L2 + 0.05)
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                L1 and L2 are relative luminances. Each sRGB channel is linearised before weighting: red 0.2126,
                green 0.7152 and blue 0.0722.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={Target} title="Thresholds at a glance" className="lg:col-span-2">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-3.5 py-3 font-bold">Content</th>
                      <th className="px-3.5 py-3 font-bold">AA</th>
                      <th className="px-3.5 py-3 font-bold">AAA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      ["Normal text", "4.5:1", "7:1"],
                      ["Large text (24px / 18.66px bold)", "3:1", "4.5:1"],
                      ["UI components and graphics", "3:1", "—"],
                      ["Focus indicators", "3:1", "—"],
                    ].map(([content, aa, aaa]) => (
                      <tr key={content}>
                        <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-200">{content}</td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white">{aa}</td>
                        <td className="px-3.5 py-2.5 text-slate-500 dark:text-slate-400">{aaa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard tone={TONE} icon={Sparkles} title="Why APCA exists">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-violet-300 dark:bg-slate-950">
                Lc = f(text luminance, background luminance, polarity)
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                APCA models perceived lightness contrast instead of a raw ratio. It accounts for polarity — dark text
                on a light background behaves differently from light text on a dark background — and returns a signed
                Lc value. The draft guidance suggests |Lc| 75+ for body text and 60+ for large or bold text. APCA is
                informative today and is being developed for WCAG 3.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={Eye} title="Designing beyond the ratio">
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <li>• Contrast is necessary but not sufficient for readability.</li>
                <li>• Avoid thin fonts and very small sizes on busy backgrounds.</li>
                <li>• Give links a second cue such as an underline.</li>
                <li>• Test hover, focus, active and disabled states.</li>
                <li>• Check both themes if your interface supports dark mode.</li>
                <li>• Use tools and real user testing, not color alone.</li>
              </ul>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone={TONE} variant="tip" title="Start with content">
              Pick text and background colors from your brand, then adjust the lighter or darker shade until the
              ratio passes. The Fix tab does this automatically.
            </Callout>
            <Callout tone="amber" variant="warning" title="Large text is not a loophole">
              3:1 is allowed for large text because size improves legibility, but body copy and form labels still
              need 4.5:1.
            </Callout>
            <Callout tone="emerald" variant="success" title="One pair at a time">
              Check every foreground/background combination that appears in the interface, including muted text,
              placeholders and borders.
            </Callout>
          </div>

          <FaqAccordion items={COLOR_CONTRAST_FAQS} tone={TONE} title="Color contrast questions, answered" />
        </div>
      )}
    </div>
  );
}
