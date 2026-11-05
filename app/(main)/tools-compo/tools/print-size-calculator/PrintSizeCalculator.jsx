"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import {
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Info,
  Layers,
  Printer,
  RotateCcw,
  Ruler,
  Save,
  Scan,
  Scissors,
  Sparkles,
  Trash2,
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
} from "../_shared/toolkit/ToolKit";
import { copyText, downloadText, readStored, toNumber, uid, writeStored } from "../_shared/toolkit/toolUtils";
import {
  LENGTH_UNITS,
  MM_PER_INCH,
  PAPER_BY_ID,
  PAPER_GROUPS,
  PAPER_SIZES,
  PRINT_FAQS,
  PRINT_STORAGE_KEY,
  aspectRatio,
  createDemoPrintState,
  formatLength,
  fromMm,
  imposition,
  paperDimensions,
  qualityBand,
  toMm,
} from "./printSizeData";

const TOOL_META = { title: "Print Size Calculator", link: "/tools/print-size-calculator", icon: "Printer" };
const TONE = "indigo";

const DEFAULT_STATE = {
  solveFor: "px-dpi",
  widthPx: "",
  heightPx: "",
  dpi: "",
  physicalWidth: "",
  physicalHeight: "",
  physicalUnit: "mm",
  paperId: "a4",
  orientation: "portrait",
  bleed: "",
  safe: "",
  cropMarks: false,
  customPaperWidth: "",
  customPaperHeight: "",
  itemWidth: "",
  itemHeight: "",
  itemGap: "3",
  sheetMargin: "5",
  presets: [],
  imageUrl: "",
  imageName: "",
};

export default function PrintSizeCalculator() {
  const { addRecentTool } = useRecentTools();
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [presetName, setPresetName] = useState("");
  const imageRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      const saved = readStored(PRINT_STORAGE_KEY, null);
      if (saved && typeof saved === "object") {
        setState((current) => ({ ...current, ...saved, imageUrl: "", imageName: "" }));
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => {
      const persisted = { ...state };
      delete persisted.imageUrl;
      delete persisted.imageName;
      writeStored(PRINT_STORAGE_KEY, persisted);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  const update = (patch) => setState((current) => ({ ...current, ...patch }));

  const paper = PAPER_BY_ID[state.paperId] || null;
  const customPaper = {
    id: "custom",
    label: "Custom paper",
    width: toNumber(state.customPaperWidth, 0),
    height: toNumber(state.customPaperHeight, 0),
  };
  const activePaper = state.paperId === "custom" ? customPaper : paper;
  const sheet = paperDimensions(activePaper, state.orientation);

  const numeric = useMemo(() => {
    const widthPx = toNumber(state.widthPx, null);
    const heightPx = toNumber(state.heightPx, null);
    const dpi = toNumber(state.dpi, null);
    const widthMm = toMm(toNumber(state.physicalWidth, null), state.physicalUnit);
    const heightMm = toMm(toNumber(state.physicalHeight, null), state.physicalUnit);
    return { widthPx, heightPx, dpi, widthMm, heightMm };
  }, [state.widthPx, state.heightPx, state.dpi, state.physicalWidth, state.physicalHeight, state.physicalUnit]);

  const derived = useMemo(() => {
    let widthPx = numeric.widthPx;
    let heightPx = numeric.heightPx;
    let widthMm = numeric.widthMm;
    let heightMm = numeric.heightMm;
    let dpi = numeric.dpi;
    let effectiveDpi = numeric.dpi;

    if (state.solveFor === "px-dpi") {
      if (widthPx > 0 && heightPx > 0 && dpi > 0) {
        widthMm = (widthPx / dpi) * MM_PER_INCH;
        heightMm = (heightPx / dpi) * MM_PER_INCH;
        effectiveDpi = dpi;
      }
    } else if (state.solveFor === "phys-dpi") {
      if (widthMm > 0 && heightMm > 0 && dpi > 0) {
        widthPx = (widthMm / MM_PER_INCH) * dpi;
        heightPx = (heightMm / MM_PER_INCH) * dpi;
        effectiveDpi = dpi;
      }
    } else if (state.solveFor === "px-phys") {
      if (widthPx > 0 && heightPx > 0 && widthMm > 0 && heightMm > 0) {
        const dpiW = widthPx / (widthMm / MM_PER_INCH);
        const dpiH = heightPx / (heightMm / MM_PER_INCH);
        effectiveDpi = Math.min(dpiW, dpiH);
        dpi = effectiveDpi;
      }
    }

    const valid = [widthPx, heightPx, widthMm, heightMm, effectiveDpi].every((value) => Number.isFinite(value) && value > 0);
    return { widthPx, heightPx, widthMm, heightMm, dpi, effectiveDpi, valid };
  }, [numeric, state.solveFor]);

  const band = qualityBand(derived.effectiveDpi);
  const megapixels = derived.widthPx && derived.heightPx ? (derived.widthPx * derived.heightPx) / 1_000_000 : null;
  const fileSizeMb = megapixels ? (derived.widthPx * derived.heightPx * 3) / (1024 * 1024) : null;
  const bleedMm = toNumber(state.bleed, 0) || 0;
  const safeMm = toNumber(state.safe, 0) || 0;
  const outerWidth = sheet.width + bleedMm * 2;
  const outerHeight = sheet.height + bleedMm * 2;

  const required300 = {
    width: Math.round((sheet.width / MM_PER_INCH) * 300),
    height: Math.round((sheet.height / MM_PER_INCH) * 300),
  };
  const required150 = {
    width: Math.round((sheet.width / MM_PER_INCH) * 150),
    height: Math.round((sheet.height / MM_PER_INCH) * 150),
  };

  const sheetLayout = useMemo(
    () =>
      imposition({
        sheetWidth: sheet.width,
        sheetHeight: sheet.height,
        itemWidth: toNumber(state.itemWidth, 0),
        itemHeight: toNumber(state.itemHeight, 0),
        gap: toNumber(state.itemGap, 0),
        margin: toNumber(state.sheetMargin, 0),
      }),
    [sheet.width, sheet.height, state.itemWidth, state.itemHeight, state.itemGap, state.sheetMargin],
  );

  const summary = useMemo(() => {
    if (!derived.valid) return "";
    return [
      "ToolsTrek print size specification",
      `Document: ${derived.widthPx.toFixed(0)} × ${derived.heightPx.toFixed(0)} px`,
      `Print size: ${formatLength(derived.widthMm, "mm")} × ${formatLength(derived.heightMm, "mm")} (${formatLength(derived.widthMm, "in")} × ${formatLength(derived.heightMm, "in")})`,
      `Resolution: ${derived.effectiveDpi.toFixed(0)} DPI — ${band?.label || ""}`,
      `Aspect ratio: ${aspectRatio(derived.widthPx, derived.heightPx)}`,
      `Megapixels: ${megapixels.toFixed(2)} MP`,
      `Uncompressed size: ${fileSizeMb.toFixed(1)} MB`,
      `Paper: ${activePaper?.label || "Custom"} ${state.orientation} (${formatLength(sheet.width, "mm")} × ${formatLength(sheet.height, "mm")})`,
      `Bleed: ${bleedMm} mm · Safe margin: ${safeMm} mm`,
      `300 DPI needs ${required300.width} × ${required300.height} px`,
    ].join("\n");
  }, [
    derived,
    band,
    megapixels,
    fileSizeMb,
    activePaper,
    state.orientation,
    sheet,
    bleedMm,
    safeMm,
    required300,
  ]);

  const handleCopy = async () => {
    if (!derived.valid) {
      toast.error("Enter a pixel size and DPI first.");
      return;
    }
    const ok = await copyText(summary);
    if (ok) toast.success("Specification copied");
    else toast.error("Could not copy");
  };

  const handleCsv = () => {
    if (!derived.valid) {
      toast.error("Enter your print values first.");
      return;
    }
    const rows = [
      ["Metric", "Value"],
      ["Width (px)", derived.widthPx.toFixed(0)],
      ["Height (px)", derived.heightPx.toFixed(0)],
      ["Width (mm)", derived.widthMm.toFixed(2)],
      ["Height (mm)", derived.heightMm.toFixed(2)],
      ["Width (in)", fromMm(derived.widthMm, "in").toFixed(2)],
      ["Height (in)", fromMm(derived.heightMm, "in").toFixed(2)],
      ["Effective DPI", derived.effectiveDpi.toFixed(0)],
      ["Quality", band?.label || ""],
      ["Aspect ratio", aspectRatio(derived.widthPx, derived.heightPx)],
      ["Megapixels", megapixels.toFixed(2)],
      ["Uncompressed MB", fileSizeMb.toFixed(1)],
      ["Paper", `${activePaper?.label || "Custom"} ${state.orientation}`],
      ["Bleed (mm)", bleedMm],
      ["Safe margin (mm)", safeMm],
      ["Pixels needed at 300 DPI", `${required300.width} × ${required300.height}`],
    ];
    downloadText(rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n"), "toolstrek-print-spec.csv", "text/csv;charset=utf-8");
    toast.success("CSV exported");
  };

  const handlePdf = () => {
    if (!derived.valid) {
      toast.error("Enter your print values first.");
      return;
    }
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFillColor(238, 242, 255);
    doc.rect(0, 0, 210, 36, "F");
    doc.setTextColor(67, 56, 202);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Print Size Specification", 14, 20);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Generated with ToolsTrek — client-side print maths", 14, 28);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text("Output document", 14, 50);

    const lines = [
      ["Pixel dimensions", `${derived.widthPx.toFixed(0)} × ${derived.heightPx.toFixed(0)} px`],
      ["Print size", `${derived.widthMm.toFixed(1)} × ${derived.heightMm.toFixed(1)} mm`],
      ["Imperial size", `${fromMm(derived.widthMm, "in").toFixed(2)} × ${fromMm(derived.heightMm, "in").toFixed(2)} in`],
      ["Effective resolution", `${derived.effectiveDpi.toFixed(0)} DPI — ${band?.label || ""}`],
      ["Aspect ratio", aspectRatio(derived.widthPx, derived.heightPx)],
      ["Megapixels", `${megapixels.toFixed(2)} MP`],
      ["Uncompressed size", `${fileSizeMb.toFixed(1)} MB`],
      ["Paper", `${activePaper?.label || "Custom"} (${state.orientation})`],
      ["Sheet size", `${sheet.width.toFixed(1)} × ${sheet.height.toFixed(1)} mm`],
      ["Bleed", `${bleedMm} mm`],
      ["Safe margin", `${safeMm} mm`],
      ["Pixels for 300 DPI", `${required300.width} × ${required300.height}`],
      ["Pixels for 150 DPI", `${required150.width} × ${required150.height}`],
    ];

    let y = 60;
    lines.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(String(label), 14, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), 82, y);
      y += 7;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Estimates only. Confirm bleed, colour profile and resolution with your print provider.", 14, 282);
    doc.save("toolstrek-print-spec.pdf");
    toast.success("PDF specification downloaded");
  };

  const handleImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPEG or WebP image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ imageUrl: String(reader.result || ""), imageName: file.name });
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const applyPaper = () => {
    if (!activePaper) return;
    const next = state.orientation === "landscape"
      ? { width: activePaper.height, height: activePaper.width }
      : { width: activePaper.width, height: activePaper.height };
    update({
      solveFor: "phys-dpi",
      physicalWidth: String(Number(next.width.toFixed(2))),
      physicalHeight: String(Number(next.height.toFixed(2))),
      physicalUnit: "mm",
      dpi: state.dpi || "300",
    });
    toast.success("Paper size applied to the output document");
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error("Give the preset a name first.");
      return;
    }
    const preset = {
      id: uid("preset"),
      name: presetName.trim(),
      paperId: state.paperId,
      customPaperWidth: state.customPaperWidth,
      customPaperHeight: state.customPaperHeight,
      orientation: state.orientation,
      bleed: state.bleed,
      safe: state.safe,
      cropMarks: state.cropMarks,
    };
    update({ presets: [...state.presets, preset] });
    setPresetName("");
    toast.success("Preset saved in this browser");
  };

  const applyPreset = (preset) => {
    update({
      paperId: preset.paperId,
      customPaperWidth: preset.customPaperWidth,
      customPaperHeight: preset.customPaperHeight,
      orientation: preset.orientation,
      bleed: preset.bleed,
      safe: preset.safe,
      cropMarks: preset.cropMarks,
    });
    toast.success(`Applied “${preset.name}”`);
  };

  const clearAll = () => {
    setState({ ...DEFAULT_STATE, presets: state.presets });
    toast.success("Inputs cleared — presets kept");
  };

  const loadDemo = () => {
    setState((current) => ({ ...current, ...createDemoPrintState(), presets: current.presets }));
    toast.success("Demo print job loaded — replace the values with your own");
  };

  const bleedPercent = outerWidth ? (bleedMm / outerWidth) * 100 : 0;
  const safePercentW = sheet.width ? (safeMm / sheet.width) * 100 : 0;
  const safePercentH = sheet.height ? (safeMm / sheet.height) * 100 : 0;

  return (
    <div className="print-size-tool space-y-6 pb-10">
      <style>{`.print-size-tool .text-xs { font-size: 13px !important; }`}</style>

      <Hero
        tone={TONE}
        eyebrow="Print production maths"
        icon={Printer}
        title="Print Size / Pixels ↔ DPI Calculator"
        description="Work out print dimensions from pixels, pixels from print size, or the effective DPI of a file. Add paper, bleed, safe margins, crop marks and sheet imposition before you send anything to a printer."
        badges={["Blank by default", "Bleed & crop marks", "Sheet imposition", "100% local"]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            icon={Ruler}
            tone={TONE}
            title="1 · What do you know?"
            description="Choose the pair you already have; the calculator fills in the rest."
            actions={<Chip tone={TONE}>Live preview</Chip>}
          >
            <div className="space-y-5">
              <Segmented
                label="Solve for"
                tone={TONE}
                value={state.solveFor}
                options={[
                  { value: "px-dpi", label: "Pixels + DPI" },
                  { value: "phys-dpi", label: "Size + DPI" },
                  { value: "px-phys", label: "Pixels + Size" },
                ]}
                onChange={(value) => update({ solveFor: value })}
                columns={3}
              />

              {state.solveFor === "px-dpi" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Width (px)">
                    <input type="number" min="0" value={state.widthPx} onChange={(event) => update({ widthPx: event.target.value })} placeholder="e.g. 3000" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Height (px)">
                    <input type="number" min="0" value={state.heightPx} onChange={(event) => update({ heightPx: event.target.value })} placeholder="e.g. 2000" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Resolution (DPI)">
                    <input type="number" min="1" value={state.dpi} onChange={(event) => update({ dpi: event.target.value })} placeholder="e.g. 300" className={fieldClass(false, TONE)} />
                  </Field>
                </div>
              )}

              {state.solveFor === "phys-dpi" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label={`Print width (${state.physicalUnit})`}>
                    <input type="number" min="0" step="0.01" value={state.physicalWidth} onChange={(event) => update({ physicalWidth: event.target.value })} placeholder="e.g. 210" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label={`Print height (${state.physicalUnit})`}>
                    <input type="number" min="0" step="0.01" value={state.physicalHeight} onChange={(event) => update({ physicalHeight: event.target.value })} placeholder="e.g. 297" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Resolution (DPI)">
                    <input type="number" min="1" value={state.dpi} onChange={(event) => update({ dpi: event.target.value })} placeholder="e.g. 300" className={fieldClass(false, TONE)} />
                  </Field>
                </div>
              )}

              {state.solveFor === "px-phys" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Width (px)">
                    <input type="number" min="0" value={state.widthPx} onChange={(event) => update({ widthPx: event.target.value })} placeholder="e.g. 3000" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Height (px)">
                    <input type="number" min="0" value={state.heightPx} onChange={(event) => update({ heightPx: event.target.value })} placeholder="e.g. 2000" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label={`Print width (${state.physicalUnit})`}>
                    <input type="number" min="0" step="0.01" value={state.physicalWidth} onChange={(event) => update({ physicalWidth: event.target.value })} placeholder="e.g. 210" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label={`Print height (${state.physicalUnit})`}>
                    <input type="number" min="0" step="0.01" value={state.physicalHeight} onChange={(event) => update({ physicalHeight: event.target.value })} placeholder="e.g. 297" className={fieldClass(false, TONE)} />
                  </Field>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Field label="Physical unit" className="w-36">
                  <select value={state.physicalUnit} onChange={(event) => update({ physicalUnit: event.target.value })} className={fieldClass(false, TONE)}>
                    {LENGTH_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </Field>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[72, 150, 300, 600].map((dpi) => (
                    <button
                      key={dpi}
                      type="button"
                      onClick={() => update({ dpi: String(dpi), solveFor: state.solveFor === "px-phys" ? "px-dpi" : state.solveFor })}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-[13px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700"
                    >
                      {dpi} DPI
                    </button>
                  ))}
                </div>
              </div>

              <Callout tone={TONE} variant="tip" title="Rule of thumb">
                300 DPI for close-up print, 200 DPI for posters, 150 DPI for large format. Pixels = inches × DPI, so a
                6-inch print at 300 DPI needs 1,800 pixels across.
              </Callout>

              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <ActionButton tone={TONE} variant="primary" icon={Wand2} onClick={loadDemo}>Load demo data</ActionButton>
                <ActionButton tone={TONE} icon={RotateCcw} onClick={clearAll}>Clear inputs</ActionButton>
                <span className="text-[13px] font-medium text-slate-400">Nothing is pre-filled.</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Scissors}
            tone={TONE}
            title="2 · Paper, bleed & safe area"
            description="Set the sheet you are printing on, then reserve bleed outside the trim and a safe area inside it."
            actions={<Chip tone={TONE}>{activePaper?.label || "Custom"} {state.orientation}</Chip>}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Paper size" hint="ISO, US, photo and envelope standards are included.">
                  <select value={state.paperId} onChange={(event) => update({ paperId: event.target.value })} className={fieldClass(false, TONE)}>
                    {PAPER_GROUPS.map((group) => (
                      <optgroup key={group} label={group}>
                        {group === "Custom" ? (
                          <option value="custom">Custom size…</option>
                        ) : (
                          PAPER_SIZES.filter((item) => item.group === group).map((item) => (
                            <option key={item.id} value={item.id}>{item.label} — {item.width} × {item.height} mm</option>
                          ))
                        )}
                      </optgroup>
                    ))}
                  </select>
                </Field>
                <Field label="Orientation">
                  <Segmented
                    tone={TONE}
                    value={state.orientation}
                    options={[
                      { value: "portrait", label: "Portrait" },
                      { value: "landscape", label: "Landscape" },
                    ]}
                    onChange={(value) => update({ orientation: value })}
                    columns={2}
                  />
                </Field>
              </div>

              {state.paperId === "custom" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Custom width (mm)">
                    <input type="number" min="1" step="0.1" value={state.customPaperWidth} onChange={(event) => update({ customPaperWidth: event.target.value })} placeholder="e.g. 210" className={fieldClass(false, TONE)} />
                  </Field>
                  <Field label="Custom height (mm)">
                    <input type="number" min="1" step="0.1" value={state.customPaperHeight} onChange={(event) => update({ customPaperHeight: event.target.value })} placeholder="e.g. 297" className={fieldClass(false, TONE)} />
                  </Field>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SliderRow label="Bleed" value={bleedMm} min={0} max={20} step={0.5} onChange={(value) => update({ bleed: String(value) })} format={(value) => `${value} mm`} tone={TONE} hint="Extra artwork outside the trim line. 3 mm is a common commercial print bleed." />
                <SliderRow label="Safe margin" value={safeMm} min={0} max={30} step={0.5} onChange={(value) => update({ safe: String(value) })} format={(value) => `${value} mm`} tone={TONE} hint="Keep text and logos inside this inner boundary." />
              </div>

              <ToggleRow
                tone={TONE}
                checked={state.cropMarks}
                onChange={(checked) => update({ cropMarks: checked })}
                label="Show crop marks in the preview"
                description="Marks sit outside the trim line and show a print shop where to cut."
              />

              <div className="flex flex-wrap items-center gap-2">
                <ActionButton tone={TONE} icon={Scan} onClick={applyPaper} disabled={!activePaper}>Use this paper as the print size</ActionButton>
                <ActionButton tone={TONE} icon={Upload} onClick={() => imageRef.current?.click()}>Preview an image</ActionButton>
                {state.imageUrl && (
                  <ActionButton tone="rose" variant="danger" icon={Trash2} onClick={() => update({ imageUrl: "", imageName: "" })}>Remove image</ActionButton>
                )}
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleImage(file);
                    event.target.value = "";
                  }}
                />
              </div>
              {state.imageName && (
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Previewing {state.imageName} — the file stays on your device.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={Layers}
            tone={TONE}
            title="3 · Sheet imposition"
            description="How many copies of a card, sticker or photo fit on one sheet — with your own gap and margin."
            actions={sheetLayout.count ? <Chip tone="emerald">{sheetLayout.count} per sheet</Chip> : null}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Field label="Item width (mm)">
                  <input type="number" min="1" step="0.1" value={state.itemWidth} onChange={(event) => update({ itemWidth: event.target.value })} placeholder="e.g. 85" className={fieldClass(false, TONE)} />
                </Field>
                <Field label="Item height (mm)">
                  <input type="number" min="1" step="0.1" value={state.itemHeight} onChange={(event) => update({ itemHeight: event.target.value })} placeholder="e.g. 55" className={fieldClass(false, TONE)} />
                </Field>
                <Field label="Gap (mm)">
                  <input type="number" min="0" step="0.5" value={state.itemGap} onChange={(event) => update({ itemGap: event.target.value })} className={fieldClass(false, TONE)} />
                </Field>
                <Field label="Sheet margin (mm)">
                  <input type="number" min="0" step="0.5" value={state.sheetMargin} onChange={(event) => update({ sheetMargin: event.target.value })} className={fieldClass(false, TONE)} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat tone={TONE} label="Grid" value={sheetLayout.count ? `${sheetLayout.columns} × ${sheetLayout.rows}` : "—"} icon={Layers} />
                <Stat tone={TONE} label="Copies" value={sheetLayout.count || "—"} icon={Copy} hint="Adjust the gap or margin to fit more" />
                <Stat tone={TONE} label="Sheet used" value={sheetLayout.count ? `${sheetLayout.utilisation.toFixed(0)}%` : "—"} icon={Sparkles} />
              </div>

              {sheetLayout.count > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <svg viewBox={`0 0 ${sheet.width} ${sheet.height}`} className="mx-auto h-auto w-full max-w-md" role="img" aria-label="Imposition layout preview">
                    <rect x="0" y="0" width={sheet.width} height={sheet.height} fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
                    {sheetLayout.positions.map((position, index) => (
                      <rect
                        key={index}
                        x={position.x}
                        y={position.y}
                        width={toNumber(state.itemWidth, 0)}
                        height={toNumber(state.itemHeight, 0)}
                        fill="#e0e7ff"
                        stroke="#6366f1"
                        strokeWidth="0.5"
                        rx="0.6"
                      />
                    ))}
                  </svg>
                  <p className="mt-2 text-center text-[13px] font-medium text-slate-500 dark:text-slate-400">
                    {sheet.width.toFixed(0)} × {sheet.height.toFixed(0)} mm sheet · {sheetLayout.count} items at {state.itemWidth} × {state.itemHeight} mm
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={Save}
            tone={TONE}
            title="4 · Saved print presets"
            description="Save the paper, bleed, safe area and marks you use most. Presets live in this browser."
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder="e.g. Client postcard 3 mm bleed"
                  className={fieldClass(false, TONE)}
                  aria-label="Preset name"
                />
                <ActionButton tone={TONE} variant="primary" icon={Save} onClick={savePreset}>Save preset</ActionButton>
              </div>

              {state.presets.length === 0 ? (
                <p className="text-[13px] text-slate-500 dark:text-slate-400">No presets yet. Save one after setting your paper and margins.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {state.presets.map((preset) => (
                    <span key={preset.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1 text-[13px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <button type="button" onClick={() => applyPreset(preset)} className="hover:text-indigo-600 dark:hover:text-indigo-300">
                        {preset.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => update({ presets: state.presets.filter((item) => item.id !== preset.id) })}
                        className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        aria-label={`Delete ${preset.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-24">
            <SectionCard
              icon={ImageIcon}
              tone={TONE}
              title="Print preview"
              description="Indigo line = trim. Dashed line = safe area. Outer edge = bleed."
            >
              <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/50">
                <div
                  className="relative mx-auto overflow-hidden bg-white shadow-md ring-1 ring-slate-300 dark:ring-slate-600"
                  style={{ width: "100%", aspectRatio: `${outerWidth || 1} / ${outerHeight || 1}` }}
                >
                  <div className="absolute inset-0 bg-white" />
                  {state.imageUrl && (
                    <img src={state.imageUrl} alt="Print preview" className="absolute inset-0 h-full w-full object-contain opacity-80" />
                  )}
                  {/* Trim area */}
                  <div
                    className="absolute border border-indigo-500"
                    style={{ left: `${bleedPercent}%`, right: `${bleedPercent}%`, top: `${bleedPercent}%`, bottom: `${bleedPercent}%` }}
                  >
                    {/* Safe area */}
                    <div
                      className="absolute border border-dashed border-emerald-500/80"
                      style={{ left: `${safePercentW}%`, right: `${safePercentW}%`, top: `${safePercentH}%`, bottom: `${safePercentH}%` }}
                    />
                  </div>
                  {state.cropMarks && (
                    <>
                      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-slate-500" />
                      <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-slate-500" />
                      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-slate-500" />
                      <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-slate-500" />
                    </>
                  )}
                </div>
                <p className="mt-3 text-center text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                  {activePaper?.label || "Custom"} · {sheet.width.toFixed(1)} × {sheet.height.toFixed(1)} mm
                </p>
                <p className="mt-1 text-center text-[13px] text-slate-500 dark:text-slate-400">
                  Bleed {bleedMm} mm · Safe {safeMm} mm
                </p>
              </div>
            </SectionCard>

            <SectionCard icon={CheckCircle2} tone={TONE} title="Resolution check">
              {!derived.valid ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <Ruler className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">Waiting for values</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Fill in the fields, or load the demo job.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{Math.round(derived.effectiveDpi)} DPI</p>
                      <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Effective resolution</p>
                    </div>
                    <Chip tone={band?.tone || "rose"}>{band?.label}</Chip>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full ${derived.effectiveDpi >= 300 ? "bg-emerald-500" : derived.effectiveDpi >= 200 ? "bg-sky-500" : derived.effectiveDpi >= 150 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${Math.min(100, (derived.effectiveDpi / 300) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{band?.note}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat tone={TONE} label="Megapixels" value={`${megapixels.toFixed(2)} MP`} />
                    <Stat tone={TONE} label="Raw file" value={`${fileSizeMb.toFixed(1)} MB`} hint="24-bit, uncompressed" />
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                    <p><strong>For 300 DPI:</strong> {required300.width} × {required300.height} px</p>
                    <p><strong>For 150 DPI:</strong> {required150.width} × {required150.height} px</p>
                    <p className="mt-1"><strong>Aspect ratio:</strong> {aspectRatio(derived.widthPx, derived.heightPx)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton tone={TONE} icon={Copy} onClick={handleCopy}>Copy</ActionButton>
                    <ActionButton tone={TONE} icon={Download} onClick={handleCsv}>CSV</ActionButton>
                    <ActionButton tone={TONE} icon={FileText} onClick={handlePdf}>PDF</ActionButton>
                    <ActionButton tone={TONE} icon={Printer} onClick={() => window.print()}>Print</ActionButton>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Info} tone={TONE} title="Quick conversions" description="The same document in every common unit.">
              <div className="space-y-1.5 text-[13px]">
                {[
                  ["Millimetres", derived.valid ? `${derived.widthMm.toFixed(1)} × ${derived.heightMm.toFixed(1)} mm` : "—"],
                  ["Centimetres", derived.valid ? `${(derived.widthMm / 10).toFixed(2)} × ${(derived.heightMm / 10).toFixed(2)} cm` : "—"],
                  ["Inches", derived.valid ? `${fromMm(derived.widthMm, "in").toFixed(2)} × ${fromMm(derived.heightMm, "in").toFixed(2)} in` : "—"],
                  ["Pixels", derived.valid ? `${derived.widthPx.toFixed(0)} × ${derived.heightPx.toFixed(0)} px` : "—"],
                  ["At 300 DPI", derived.valid ? `${Math.round(derived.widthMm / 25.4 * 300)} × ${Math.round(derived.heightMm / 25.4 * 300)} px` : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">{value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <FaqAccordion tone={TONE} items={PRINT_FAQS} title="Print size, DPI and bleed questions" />
    </div>
  );
}
