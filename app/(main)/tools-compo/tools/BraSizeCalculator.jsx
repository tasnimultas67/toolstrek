"use client";

import React, { useState, useMemo, useEffect } from "react";
import ToolPageShell from "../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Ruler,
  Sparkles,
  Download,
  Copy,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Scale,
  Heart,
  Activity,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Settings,
} from "lucide-react";

// International Cup Mapping Systems
const UK_CUPS = ["AA", "A", "B", "C", "D", "DD", "E", "F", "FF", "G", "GG", "H", "HH", "J", "JJ", "K", "KK"];
const US_CUPS = ["AA", "A", "B", "C", "D", "DD", "DDD/F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
const EU_CUPS = ["AA", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];

export default function BraSizeCalculator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Bra Size Calculator",
      link: "/tools/bra-size-calculator",
      icon: "Ruler",
    });
  }, [addRecentTool]);

  // ─── BASIC FORM STATE ──────────────────────────────────────────────────────
  const [unit, setUnit] = useState("in"); // "in" | "cm"
  const [calcMethod, setCalcMethod] = useState("basic"); // "basic" | "advanced"
  const [underbustBasic, setUnderbustBasic] = useState(32);
  const [bustBasic, setBustBasic] = useState(36);

  // ─── ADVANCED (6-MEASUREMENTS) STATE ───────────────────────────────────────
  const [looseUnderbust, setLooseUnderbust] = useState(32);
  const [snugUnderbust, setSnugUnderbust] = useState(31);
  const [tightUnderbust, setTightUnderbust] = useState(30);
  const [standingBust, setStandingBust] = useState(35);
  const [leaningBust, setLeaningBust] = useState(37);
  const [lyingBust, setLyingBust] = useState(36);

  // ─── FITTING PREFERENCES ──────────────────────────────────────────────────
  const [asab, setAsab] = useState("afab"); // "afab" | "amab"
  const [shape, setShape] = useState("medium"); // "shallow" | "medium" | "projected"
  const [fullness, setFullness] = useState("even"); // "top" | "even" | "bottom"
  const [bandPreference, setBandPreference] = useState("snug"); // "snug" | "loose" | "tight"
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ─── VISUALIZER TAB ────────────────────────────────────────────────────────
  const [visualTab, setVisualTab] = useState("side"); // "side" | "front"

  // FAQ Expand state
  const [faqExpanded, setFaqExpanded] = useState({});

  const toggleFaq = (index) => {
    setFaqExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Convert basic metrics if unit changes
  useEffect(() => {
    if (unit === "cm") {
      setUnderbustBasic((prev) => Math.round(prev * 2.54));
      setBustBasic((prev) => Math.round(prev * 2.54));
      setLooseUnderbust((prev) => Math.round(prev * 2.54));
      setSnugUnderbust((prev) => Math.round(prev * 2.54));
      setTightUnderbust((prev) => Math.round(prev * 2.54));
      setStandingBust((prev) => Math.round(prev * 2.54));
      setLeaningBust((prev) => Math.round(prev * 2.54));
      setLyingBust((prev) => Math.round(prev * 2.54));
    } else {
      setUnderbustBasic((prev) => Math.round(prev / 2.54));
      setBustBasic((prev) => Math.round(prev / 2.54));
      setLooseUnderbust((prev) => Math.round(prev / 2.54));
      setSnugUnderbust((prev) => Math.round(prev / 2.54));
      setTightUnderbust((prev) => Math.round(prev / 2.54));
      setStandingBust((prev) => Math.round(prev / 2.54));
      setLeaningBust((prev) => Math.round(prev / 2.54));
      setLyingBust((prev) => Math.round(prev / 2.54));
    }
  }, [unit]);

  // Convert values to inches for calculation logic
  const inputsInInches = useMemo(() => {
    const isCm = unit === "cm";
    const toIn = (val) => (isCm ? parseFloat(val) / 2.54 : parseFloat(val));

    if (calcMethod === "basic") {
      const uBasic = toIn(underbustBasic) || 0;
      const bBasic = toIn(bustBasic) || 0;
      return {
        looseU: uBasic + 0.5,
        snugU: uBasic,
        tightU: Math.max(0, uBasic - 0.5),
        standB: bBasic,
        leanB: bBasic,
        lieB: bBasic,
      };
    } else {
      return {
        looseU: toIn(looseUnderbust) || 0,
        snugU: toIn(snugUnderbust) || 0,
        tightU: toIn(tightUnderbust) || 0,
        standB: toIn(standingBust) || 0,
        leanB: toIn(leaningBust) || 0,
        lieB: toIn(lyingBust) || 0,
      };
    }
  }, [
    unit,
    calcMethod,
    underbustBasic,
    bustBasic,
    looseUnderbust,
    snugUnderbust,
    tightUnderbust,
    standingBust,
    leaningBust,
    lyingBust,
  ]);

  // ─── CALCULATE RESULTS ─────────────────────────────────────────────────────
  const results = useMemo(() => {
    const { looseU, snugU, tightU, standB, leanB, lieB } = inputsInInches;

    if (snugU <= 0 || standB <= 0) {
      return {
        bandUK: 0,
        bandEU: 0,
        bandAU: 0,
        bandFR: 0,
        cupIndex: 0,
        cupUK: "AA",
        cupUS: "AA",
        cupEU: "AA",
        cupJP: "A",
        sisterTighter: "",
        sisterLooser: "",
        weightEst: 0,
        volumeEst: 0,
        shapeAdvised: "Plunge / Balcony",
        error: "Please enter valid measurements",
      };
    }

    // 1. CALCULATE BAND SIZE
    let band = Math.round(snugU / 2) * 2;

    if (band < tightU + 1) {
      band += 2;
    }

    if (bandPreference === "loose") {
      band += 2;
    } else if (bandPreference === "tight") {
      if (band - 2 >= tightU + 0.5) {
        band -= 2;
      }
    }

    band = Math.max(26, Math.min(56, band));

    // 2. CALCULATE BUST VALUE FOR CUP SIZE
    let bustValue = standB;
    const projDiff = leanB - standB;

    if (calcMethod === "advanced") {
      if (projDiff >= 2.5) {
        bustValue = (standB + leanB + lieB) / 3;
      } else {
        bustValue = leanB;
      }
    } else {
      bustValue = standB;
    }

    // Adjustments for assigned sex at birth (AMAB has shallower/wider chest tissues)
    let cupDiff = bustValue - band;
    if (asab === "amab") {
      cupDiff = Math.max(0, cupDiff - 0.8);
    }

    // Adjustments for shape and fullness preferences
    if (shape === "shallow") cupDiff = Math.max(0, cupDiff - 0.3);
    else if (shape === "projected") cupDiff += 0.3;

    if (fullness === "top") cupDiff += 0.5;
    else if (fullness === "bottom") cupDiff = Math.max(0, cupDiff - 0.5);

    // Map difference to cup indexes
    let cupIndex = Math.round(cupDiff);
    cupIndex = Math.max(0, Math.min(UK_CUPS.length - 1, cupIndex));

    const cupUK = UK_CUPS[cupIndex];
    const cupUS = US_CUPS[cupIndex];
    const cupEU = EU_CUPS[cupIndex];

    const jpIndex = Math.min(EU_CUPS.length - 1, cupIndex + 1);
    const cupJP = EU_CUPS[jpIndex];

    // Conversions for other systems
    const bandUK = band;
    const bandUS = band;
    const bandEU = Math.round((band - 30) / 2 * 5 + 65);
    const bandAU = band - 22;
    const bandFR = bandEU + 15;

    // Sister Sizes
    let sisterTighter = "";
    if (band - 2 >= 26 && cupIndex + 1 < UK_CUPS.length) {
      sisterTighter = `${band - 2}${UK_CUPS[cupIndex + 1]}`;
    }
    let sisterLooser = "";
    if (band + 2 <= 56 && cupIndex - 1 >= 0) {
      sisterLooser = `${band + 2}${UK_CUPS[cupIndex - 1]}`;
    }

    // Breast volume & weight estimation per breast
    let volumeEst = 0;
    if (cupIndex > 0) {
      volumeEst = Math.round((band / 32) * (cupIndex * 160));
    } else {
      volumeEst = Math.round((band / 32) * 80);
    }
    const weightEst = Math.round(volumeEst * 0.9);

    // Bra Shape Recommendations based on projection/fullness
    let shapeAdvised = "Full Cup / T-Shirt Bra";
    if (shape === "projected" || fullness === "bottom") {
      shapeAdvised = "Balconette / Plunge / Underwired";
    } else if (shape === "shallow" || fullness === "top") {
      shapeAdvised = "Demi-Cup / Demi-Plunge / Bralette";
    }

    return {
      bandUK,
      bandUS,
      bandEU,
      bandAU,
      bandFR,
      cupIndex,
      cupUK,
      cupUS,
      cupEU,
      cupJP,
      sisterTighter,
      sisterLooser,
      weightEst,
      volumeEst,
      shapeAdvised,
      error: null,
    };
  }, [inputsInInches, bandPreference, asab, shape, fullness, calcMethod]);

  // ─── COPING TEXT SUMMARY ───────────────────────────────────────────────────
  const handleCopySummary = () => {
    if (results.error) {
      toast.error("Please enter valid measurements first.");
      return;
    }

    const { looseU, snugU, tightU, standB, leanB, lieB } = inputsInInches;

    const text = `
✨ Bra Size Fitting Report (Bangladesh & Global Sizing Guide) ✨
-----------------------------------------------------------------
📏 Measurements (in ${unit === "in" ? "Inches" : "Centimeters"}):
  - Snug Underbust: ${snugU.toFixed(1)}"
  - Standing Bust: ${standB.toFixed(1)}"
  ${
    calcMethod === "advanced"
      ? `  - Loose Underbust: ${looseU.toFixed(1)}"
  - Tight Underbust: ${tightU.toFixed(1)}"
  - Leaning Bust: ${leaningBust.toFixed(1)}"
  - Lying Bust: ${lyingBust.toFixed(1)}"`
      : ""
  }
🛠 Parameters:
  - Sizing Mode: ${calcMethod === "basic" ? "Basic (2-Measures)" : "ABTF (6-Measures)"}
  - Preference: Band (${bandPreference}), Fullness (${fullness}), Shape (${shape})
  - assigned sex: ${asab.toUpperCase()}

🏆 Calculated Bra Size:
  - BD / UK Standard Size: ${results.bandUK}${results.cupUK} (Suitable for Aarong, Sailor, etc.)
  - US Size: ${results.bandUS}${results.cupUS}
  - EU Size: ${results.bandEU}${results.cupEU}
  - AU / NZ Size: ${results.bandAU}${results.cupUK}
  - FR Size: ${results.bandFR}${results.cupEU}
  - JP Size: ${results.bandEU}${results.cupJP}

💞 Sister Sizes (Alternative band & cup volume equivalency):
  - Tighter Band Sister: ${results.sisterTighter ? results.sisterTighter + " (UK)" : "N/A"}
  - Looser Band Sister: ${results.sisterLooser ? results.sisterLooser + " (UK)" : "N/A"}

🧪 Breast Tissue Estimates (Per Breast):
  - Approx. Volume: ${results.volumeEst} cc
  - Approx. Weight: ${results.weightEst} grams (g)

🧥 Advised Bra Style: ${results.shapeAdvised}
Generated by ToolsTrek Bra Calculator (BD & Global)
`;

    navigator.clipboard.writeText(text.trim());
    toast.success("Summary report copied to clipboard!");
  };

  // ─── DOWNLOAD PDF REPORT ──────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (results.error) {
      toast.error("Please enter valid measurements first.");
      return;
    }

    try {
      const doc = new jsPDF();
      const { looseU, snugU, tightU, standB, leanB, lieB } = inputsInInches;

      const primaryColor = [124, 0, 254]; 
      const textColor = [30, 41, 59]; 
      const mutedTextColor = [100, 116, 139]; 

      // Header Banner
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 45, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Bra Size Fitting Report (Bangladesh & Global)", 14, 25);

      doc.setFontSize(10);
      doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
      doc.text(`Calculated for local & international sizing standards on ${new Date().toLocaleDateString()}`, 14, 35);

      // Section 1: User Measurements
      doc.setFontSize(13);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("1. Measurements Summary", 14, 60);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Sizing Method: ${calcMethod === "basic" ? "Basic (2-Measurements)" : "ABTF Advanced Sizing (6-Measurements)"}`, 14, 68);
      doc.text(`assigned sex: ${asab.toUpperCase()} | Shape Preference: ${shape} | Fullness: ${fullness}`, 14, 73);

      // Measurements Box
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(14, 78, 182, 32, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Ribcage (Underbust)", 20, 85);
      doc.text("Bust (Overbust)", 110, 85);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      if (calcMethod === "basic") {
        doc.text(`Snug Underbust: ${snugU.toFixed(1)}" (${Math.round(snugU * 2.54)}cm)`, 20, 93);
        doc.text(`Standing Bust: ${standB.toFixed(1)}" (${Math.round(standB * 2.54)}cm)`, 110, 93);
      } else {
        doc.text(`Loose: ${looseU.toFixed(1)}" | Snug: ${snugU.toFixed(1)}" | Tight: ${tightU.toFixed(1)}"`, 20, 93);
        doc.text(`Standing: ${standB.toFixed(1)}" | Leaning: ${leanB.toFixed(1)}" | Lying: ${lieB.toFixed(1)}"`, 110, 93);
      }

      // Section 2: Calculated Sizes Table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. Calculated Sizing Matrix", 14, 125);

      // Table Header
      doc.setFillColor(30, 41, 59);
      doc.rect(14, 132, 182, 8, "F");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Region / Standard System", 20, 137);
      doc.text("Band", 80, 137);
      doc.text("Cup", 130, 137);
      doc.text("Size Label", 165, 137);

      const rows = [
        { reg: "BD / UK Standard (Aarong, Sailor)", band: results.bandUK, cup: results.cupUK, full: `${results.bandUK}${results.cupUK}` },
        { reg: "United States (US)", band: results.bandUS, cup: results.cupUS, full: `${results.bandUS}${results.cupUS}` },
        { reg: "Europe (EU)", band: results.bandEU, cup: results.cupEU, full: `${results.bandEU}${results.cupEU}` },
        { reg: "Australia / NZ (AU)", band: results.bandAU, cup: results.cupUK, full: `${results.bandAU}${results.cupUK}` },
        { reg: "France (FR)", band: results.bandFR, cup: results.cupEU, full: `${results.bandFR}${results.cupEU}` },
        { reg: "Japan (JP)", band: results.bandEU, cup: results.cupJP, full: `${results.bandEU}${results.cupJP}` },
      ];

      let rowY = 146;
      rows.forEach((r, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, rowY - 4, 182, 7, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(r.reg, 20, rowY);
        doc.text(String(r.band), 80, rowY);
        doc.text(r.cup, 130, rowY);
        doc.setFont("helvetica", "bold");
        doc.text(r.full, 165, rowY);
        rowY += 7;
      });

      // Section 3: Sister Sizes & Tissue Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("3. Sizing Insights & Fit Suggestions", 14, rowY + 12);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, rowY + 18, 182, 38, 2, 2, "F");

      doc.setFontSize(9.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("Sister Sizes Volume Equivalents:", 20, rowY + 25);
      doc.setFont("helvetica", "normal");
      doc.text(`- Tighter Band Sister: ${results.sisterTighter ? results.sisterTighter : "N/A"}`, 25, rowY + 31);
      doc.text(`- Looser Band Sister: ${results.sisterLooser ? results.sisterLooser : "N/A"}`, 25, rowY + 36);

      doc.setFont("helvetica", "bold");
      doc.text("Estimated Anatomical Volumes (Per Breast):", 110, rowY + 25);
      doc.setFont("helvetica", "normal");
      doc.text(`- Approx. Volume: ${results.volumeEst} cc`, 115, rowY + 31);
      doc.text(`- Approx. Weight: ${results.weightEst} grams (g)`, 115, rowY + 36);
      doc.text(`- Suggested Cut Styles: ${results.shapeAdvised}`, 115, rowY + 41);

      // Section 4: Fitting Checklist
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Fit Quality Indicators Checklist:", 14, rowY + 65);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("1. Band: The band should sit flat all around your chest and shouldn't ride up at the back.", 14, rowY + 72);
      doc.text("2. Cups: No tissue spillage (double-boob) over the top, and no loose fabric gaps.", 14, rowY + 77);
      doc.text("3. Center bridge: The wire bridge in the center should touch your sternum flatly.", 14, rowY + 82);
      doc.text("4. Local BD Markets Note: Local shops often sell by numbers only (like 36) which assumes B cups.", 14, rowY + 87);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
      doc.text("ToolsTrek Sizing Report — Find more tools at https://toolstrek.vercel.app", 14, 285);

      doc.save(`ToolsTrek_BraSize_Report_${results.bandUK}${results.cupUK}.pdf`);
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // ─── FORM RESET ────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (unit === "in") {
      setUnderbustBasic(32);
      setBustBasic(36);
      setLooseUnderbust(32);
      setSnugUnderbust(31);
      setTightUnderbust(30);
      setStandingBust(35);
      setLeaningBust(37);
      setLyingBust(36);
    } else {
      setUnderbustBasic(81);
      setBustBasic(91);
      setLooseUnderbust(81);
      setSnugUnderbust(79);
      setTightUnderbust(76);
      setStandingBust(89);
      setLeaningBust(94);
      setLyingBust(91);
    }
    setAsab("afab");
    setShape("medium");
    setFullness("even");
    setBandPreference("snug");
    toast.success("Form inputs reset to defaults.");
  };

  // Calculate dynamic dimensions for SVG Chest shape
  const svgDimensions = useMemo(() => {
    const { snugU, standB, leanB } = inputsInInches;
    const bandVal = snugU || 32;
    const cupDiff = Math.max(0, (leanB || standB) - bandVal);

    const bandPercent = Math.min(100, Math.max(0, ((bandVal - 26) / (48 - 26)) * 100));
    const ribScale = 0.85 + (bandPercent / 100) * 0.35;

    const cupPercent = Math.min(100, Math.max(0, (cupDiff / 14) * 100));
    const projection = (cupPercent / 100) * 35;

    return {
      ribScale,
      projection,
      bandLabel: `${Math.round(snugU)} ${unit === "in" ? "in" : "cm"}`,
      bustLabel: `${Math.round(standB)} ${unit === "in" ? "in" : "cm"}`,
      cupDiff,
    };
  }, [inputsInInches, unit]);

  return (
    <ToolPageShell>
      {/* Scope style block to enforce exact mobile (12px) and laptop (14px) minimum font constraints */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bra-calculator-tool {
          font-family: inherit;
          font-size: 14px;
        }
        @media (max-width: 767px) {
          .bra-calculator-tool {
            font-size: 12px;
          }
        }
        @media (min-width: 768px) {
          .bra-calculator-tool {
            font-size: 14px;
          }
        }
      ` }} />

      <div className="bra-calculator-tool w-full max-w-6xl mx-auto space-y-8 pb-12 text-slate-800 dark:text-slate-100">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 text-white p-6 sm:p-10 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-pink-200 animate-pulse" />
              Bangladesh & Global Sizing Guide
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Bra Size Calculator
            </h1>
            <p className="text-pink-50 max-w-2xl text-xs sm:text-sm md:text-base font-medium leading-relaxed">
              Find your perfect, comfortable bra fit. Ditch the outdated +4 store sizing method and calculate your true starting size for local Bangladeshi brands (like Aarong, Sailor) and international standards.
            </p>
          </div>
        </div>

        {/* MAIN LAYOUT GRID (UNIQUE SPLIT DESIGN) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE (60% COLUMN): CONTROLS & FORM */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-violet-500" />
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    Calculator Inputs
                  </h2>
                </div>

                {/* Sizing Unit Switcher */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUnit("in")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        unit === "in"
                          ? "bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      Inches (Tailoring Tape)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit("cm")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        unit === "cm"
                          ? "bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>
                </div>
              </div>

              {/* METHOD TAB SYSTEM */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCalcMethod("basic")}
                  className={`py-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                    calcMethod === "basic"
                      ? "bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Standard Fit (2 Measures)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMethod("advanced")}
                  className={`py-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                    calcMethod === "advanced"
                      ? "bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  ABTF 6-Measurement Fit
                </button>
              </div>

              {/* FORM MEASUREMENTS */}
              {calcMethod === "basic" ? (
                // ─── BASIC MODE INPUTS ───
                <div className="space-y-6">
                  {/* Underbust Basic Slider + Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span>1. Snug Underbust</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Measure firmly around your ribcage directly beneath your breasts, level with the floor." />
                      </label>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-900">
                        {underbustBasic} {unit}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <input
                        type="range"
                        min={unit === "in" ? 24 : 60}
                        max={unit === "in" ? 50 : 125}
                        step={unit === "in" ? 0.5 : 1}
                        value={underbustBasic}
                        onChange={(e) => setUnderbustBasic(parseFloat(e.target.value))}
                        className="sm:col-span-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                      />
                      <input
                        type="number"
                        min={unit === "in" ? 24 : 60}
                        max={unit === "in" ? 50 : 125}
                        step={0.1}
                        value={underbustBasic}
                        onChange={(e) => setUnderbustBasic(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bust Basic Slider + Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span>2. Fullest Bust</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Measure around the fullest part of your breasts while standing upright." />
                      </label>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-900">
                        {bustBasic} {unit}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <input
                        type="range"
                        min={unit === "in" ? 26 : 65}
                        max={unit === "in" ? 64 : 160}
                        step={unit === "in" ? 0.5 : 1}
                        value={bustBasic}
                        onChange={(e) => setBustBasic(parseFloat(e.target.value))}
                        className="sm:col-span-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                      <input
                        type="number"
                        min={unit === "in" ? 26 : 65}
                        max={unit === "in" ? 64 : 160}
                        step={0.1}
                        value={bustBasic}
                        onChange={(e) => setBustBasic(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // ─── ADVANCED ABTF MODE INPUTS ───
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-violet-50/50 dark:bg-slate-800/40 border border-violet-100 dark:border-violet-900/60 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                      For advanced fitting, measure in inches/cm using a tailoring tape. The 6 metrics evaluate rib compressibility & tissue projection for a highly refined starting size.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">
                      Underbust Measurements
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Loose */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                          <span>Loose Underbust</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{looseUnderbust}{unit}</span>
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={looseUnderbust}
                          onChange={(e) => setLooseUnderbust(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>
                      {/* Snug */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                          <span>Snug Underbust</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{snugUnderbust}{unit}</span>
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={snugUnderbust}
                          onChange={(e) => setSnugUnderbust(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>
                      {/* Tight */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                          <span>Tight Underbust</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{tightUnderbust}{unit}</span>
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={tightUnderbust}
                          onChange={(e) => setTightUnderbust(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-rose-500 dark:text-rose-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">
                      Bust Measurements
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Standing */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                          <span>Standing Bust</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{standingBust}{unit}</span>
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={standingBust}
                          onChange={(e) => setStandingBust(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                      {/* Leaning */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                          <span>Leaning Bust</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{leaningBust}{unit}</span>
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={leaningBust}
                          onChange={(e) => setLeaningBust(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                      {/* Lying */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                          <span>Lying Bust</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{lyingBust}{unit}</span>
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={lyingBust}
                          onChange={(e) => setLyingBust(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADVANCED PARAMETERS PANEL TRIGGER */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-violet-500" />
                    <span>Advanced Customizations & Fit Tuning</span>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {/* ADVANCED TUNING CONTROLS */}
                {showAdvanced && (
                  <div className="mt-4 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    
                    {/* Assigned Sex at Birth */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-violet-500" />
                        Assigned Sex at Birth
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "afab", label: "AFAB (Cis Female / Standard)" },
                          { id: "amab", label: "AMAB (Trans-Inclusive / Broad Ribs)" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setAsab(item.id)}
                            className={`p-3 rounded-xl text-xs font-bold border text-center transition-all ${
                              asab === item.id
                                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Band Comfort preference */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-violet-500" />
                        Band Snugness Preference
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "tight", label: "Tight Fit (More Support)" },
                          { id: "snug", label: "Snug Fit (Recommended)" },
                          { id: "loose", label: "Loose Comfort" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setBandPreference(item.id)}
                            className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                              bandPreference === item.id
                                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Breast fullness & profile projection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Fullness */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Tissue Fullness Distribution
                        </label>
                        <select
                          value={fullness}
                          onChange={(e) => setFullness(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        >
                          <option value="even">Even Distribution (Balanced)</option>
                          <option value="top">Full on Top (Upper volume)</option>
                          <option value="bottom">Full on Bottom (Lower volume)</option>
                        </select>
                      </div>

                      {/* Projection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Anatomical Projection (Depth)
                        </label>
                        <select
                          value={shape}
                          onChange={(e) => setShape(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        >
                          <option value="shallow">Shallow (Wide breast root)</option>
                          <option value="medium">Average Projection</option>
                          <option value="projected">Highly Projected (Deeper cups)</option>
                        </select>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* ACTION TOOLBAR */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                  Reset Inputs
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <Copy className="w-4.5 h-4.5 text-violet-500" />
                    Copy Summary
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-4 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Download PDF
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (40% COLUMN): LIVE RESULTS & SVG DIAGRAM */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* HERO RESULTS CONTAINER */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* HEADER BADGE */}
              <div className="text-center space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-300">
                  Recommended Bra Size
                </span>

                <div className="flex items-baseline justify-center gap-1.5 pt-3">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {results.bandUK || 32}
                  </span>
                  <span className="text-4xl font-extrabold text-violet-600 dark:text-violet-400">
                    {results.cupUK || "A"}
                  </span>
                  <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
                    (UK/BD Sizing)
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Equivalent to US <span className="text-violet-600 font-extrabold">{results.bandUS}{results.cupUS}</span> &bull; EU <span className="text-violet-600 font-extrabold">{results.bandEU}{results.cupEU}</span>
                </div>
              </div>

              {/* DYNAMIC SVG CHEST VISUALIZER */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
                
                {/* SVG Visualizer Header Tab */}
                <div className="flex gap-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => setVisualTab("side")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      visualTab === "side"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Side View (Projection)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisualTab("front")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      visualTab === "front"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Front View (Band Width)
                  </button>
                </div>

                {/* SVG CONTAINER */}
                <div className="w-full h-44 flex items-center justify-center relative">
                  {visualTab === "side" ? (
                    // SIDE VIEW PROFILE SVG
                    <svg
                      viewBox="0 0 180 200"
                      className="w-full h-full max-w-[150px] overflow-visible"
                    >
                      <defs>
                        <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="80" cy="100" r="70" fill="url(#bodyGlow)" />

                      <path
                        d={`
                          M 40,20 
                          L 40,45 
                          C 43,48 45,52 45,58 
                          C 45,65 52,70 ${55 + svgDimensions.projection},78
                          C ${55 + svgDimensions.projection * 1.3},83 ${60 + svgDimensions.projection},98 ${55 + svgDimensions.projection},105
                          C 50,112 43,115 42,125
                          C 41,135 44,150 48,175
                        `}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />

                      <path
                        d="M 120,20 L 120,175"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="dark:stroke-slate-800"
                      />

                      <line
                        x1="41.5"
                        y1="125"
                        x2="120"
                        y2="125"
                        stroke="#7c00fe"
                        strokeWidth="2.5"
                        strokeDasharray="3 3"
                        className="transition-all duration-300"
                      />
                      <circle cx="41.5" cy="125" r="4" fill="#7c00fe" />
                      <circle cx="120" cy="125" r="4" fill="#7c00fe" />

                      <line
                        x1={56 + svgDimensions.projection}
                        y1="90"
                        x2="120"
                        y2="90"
                        stroke="#ec4899"
                        strokeWidth="2.5"
                        strokeDasharray="3 3"
                        className="transition-all duration-300"
                      />
                      <circle cx={56 + svgDimensions.projection} cy="90" r="4" fill="#ec4899" />
                      <circle cx="120" cy="90" r="4" fill="#ec4899" />

                      <text x="126" y="93" fill="#ec4899" className="text-[10px] font-black tracking-wider uppercase">
                        Bust: {svgDimensions.bustLabel}
                      </text>
                      <text x="126" y="128" fill="#7c00fe" className="text-[10px] font-black tracking-wider uppercase">
                        Band: {svgDimensions.bandLabel}
                      </text>
                    </svg>
                  ) : (
                    // FRONT VIEW SILHOUETTE SVG
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full max-w-[180px] overflow-visible"
                    >
                      <g style={{ transform: `scaleX(${svgDimensions.ribScale})`, transformOrigin: "100px 100px" }} className="transition-all duration-300">
                        <path
                          d="M 50,30 C 50,45 60,50 68,55 C 68,70 65,85 64,120 C 63,140 68,160 74,180"
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                          className="dark:stroke-slate-700"
                        />
                        <path
                          d="M 150,30 C 150,45 140,50 132,55 C 132,70 135,85 136,120 C 137,140 132,160 126,180"
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                          className="dark:stroke-slate-700"
                        />

                        <line x1="68" y1="120" x2="132" y2="120" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-700" />

                        <circle
                          cx="85"
                          cy="95"
                          r={20 + svgDimensions.projection * 0.4}
                          fill="none"
                          stroke="#f472b6"
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />
                        <circle
                          cx="115"
                          cy="95"
                          r={20 + svgDimensions.projection * 0.4}
                          fill="none"
                          stroke="#f472b6"
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />

                        <path
                          d="M 66,120 C 85,123 115,123 134,120"
                          fill="none"
                          stroke="#7c00fe"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      </g>

                      <text x="100" y="145" textAnchor="middle" fill="#7c00fe" className="text-[10px] font-black">
                        Band Width: {svgDimensions.bandLabel}
                      </text>
                      <text x="100" y="68" textAnchor="middle" fill="#ec4899" className="text-[10px] font-black">
                        Cup Vol: +{svgDimensions.cupDiff.toFixed(1)}" Diff
                      </text>
                    </svg>
                  )}
                </div>
              </div>

              {/* SISTER SIZES DISPLAY */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-violet-500" />
                  Sister Sizes (Equivalent Volume)
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Tighter Band Option</span>
                    <span className="text-lg font-black text-violet-600 dark:text-violet-400 mt-1 block">
                      {results.sisterTighter ? `${results.sisterTighter}` : "None"}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block mt-1">
                      If the band feels loose, choose 1 size smaller band and 1 size larger cup.
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Looser Band Option</span>
                    <span className="text-lg font-black text-violet-600 dark:text-violet-400 mt-1 block">
                      {results.sisterLooser ? `${results.sisterLooser}` : "None"}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block mt-1">
                      If the band feels tight, choose 1 size larger band and 1 size smaller cup.
                    </span>
                  </div>
                </div>
              </div>

              {/* ANATOMICAL DETAILS & RECOMMENDATIONS */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-violet-500" />
                  Tissue Volume & Shape Insights
                </h3>

                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-500">Est. Breast Tissue Volume</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">~{results.volumeEst} cc / breast</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-500">Est. Tissue Weight</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">~{results.weightEst} grams (g) / breast</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300">
                    <span>Advised Bra Style</span>
                    <span className="font-bold">{results.shapeAdvised}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* INTERNATIONAL CONVERSION MATRIX SECTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-violet-500" />
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
              International Bra Sizing Matrix
            </h3>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-normal">
            For Bangladeshi buyers, local premium brands (like Aarong, Sailor, La Reve) and online lingerie outlets utilize the **UK/US standard** (e.g., 34B, 36C). Refer below to convert your calculated fit into other major global systems.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: "UK / BD Standard (Aarong)", band: results.bandUK, cup: results.cupUK, code: "BD/UK" },
              { label: "United States (US)", band: results.bandUS, cup: results.cupUS, code: "US" },
              { label: "Europe (EU)", band: results.bandEU, cup: results.cupEU, code: "EU" },
              { label: "Australia / NZ (AU)", band: results.bandAU, cup: results.cupUK, code: "AU" },
              { label: "France (FR)", band: results.bandFR, cup: results.cupEU, code: "FR" },
              { label: "Japan (JP)", band: results.bandEU, cup: results.cupJP, code: "JP" },
            ].map((sys, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 block">
                    {sys.label}
                  </span>
                  <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto overflow-hidden text-[9px] flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                    {sys.code}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Band: {sys.band}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 block">
                    Cup: {sys.cup}
                  </span>
                  <div className="text-lg font-black text-violet-600 dark:text-violet-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                    {sys.band}{sys.cup}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULA & THE "+4 MYTH" EXPLANATION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* THE FORMULA CARD */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-500" />
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Sizing Formulas Explained
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                Calculations for professional bra sizing rely on two raw metrics: the **Band Size** (ribcage perimeter) and the **Cup Size** (breast projection volume).
              </p>

              {/* Band Size Formula */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                  1. Band Size Formula (UK/US standard)
                </h4>
                <p className="font-mono text-violet-600 dark:text-violet-400 font-bold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg inline-block border border-slate-100 dark:border-slate-800">
                  Band = round(Snug Underbust / 2) * 2
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  *If the band size is smaller than the tightest ribs compression (Tight Underbust + 1 inch), we adjust the band up to the next even number to ensure proper rib expanding/breathing.*
                </p>
              </div>

              {/* Cup Size Formula */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  2. Cup Size Formula
                </h4>
                <p className="font-mono text-pink-600 dark:text-pink-400 font-bold bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg inline-block border border-slate-100 dark:border-slate-800">
                  Cup Difference = (Selected Bust - Band Size)
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  *Cup letters are mapped dynamically: 1" = A, 2" = B, 3" = C, 4" = D, 5" = DD, 6" = E, etc. If the leaning bust differs significantly from the standing bust (indicating projected tissue), we average all three bust metrics.*
                </p>
              </div>
            </div>
          </div>

          {/* THE "+4 MYTH" CARD */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                The "+4 Inch" Sizing Myth
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                Many stores and old sizing calculators instruct users to add **4 or 5 inches** to their underbust to determine the band size. For instance, if you measure 30" underbust, they calculate your band as 34".
              </p>
              
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                <strong>Why is this incorrect?</strong> Adding 4 inches yields a band that is too loose to provide under-bust support. This shifts all support onto the shoulder straps, leading to back pain and slippage. It also forces you into a cup size that is too small.
              </div>

              <div className="grid grid-cols-2 gap-3 text-center border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Outdated +4 Method</span>
                  <span className="text-xl font-bold text-rose-500 block">36A</span>
                  <span className="text-[10px] text-slate-500">Loose band, digging straps</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">True Modern Method</span>
                  <span className="text-xl font-bold text-emerald-500 block">32D</span>
                  <span className="text-[10px] text-slate-500">Supportive band, comfortable straps</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* EDUCATIONAL & GUIDE SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* HOW TO MEASURE GUIDE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-violet-500" />
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                How to Measure Correctly
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>
                Use a flexible plastic tailoring tape (widely available in local tailoring shops in Bangladesh). Keep the tape level to the floor and measure without wearing a padded bra.
              </p>

              <ol className="space-y-4 list-decimal list-inside">
                <li className="space-y-1">
                  <strong className="text-slate-800 dark:text-slate-250">Loose Underbust:</strong>
                  <span className="block pl-4 text-xs text-slate-500">Wrap the tape comfortably around your ribcage directly beneath your breasts. The tape should rest snugly but not squeeze the chest.</span>
                </li>
                <li className="space-y-1">
                  <strong className="text-slate-800 dark:text-slate-250">Snug Underbust:</strong>
                  <span className="block pl-4 text-xs text-slate-500">Wrap the tape firmly around your ribcage. It should feel as snug as you want your bra band to feel—supportive but comfortable.</span>
                </li>
                <li className="space-y-1">
                  <strong className="text-slate-800 dark:text-slate-250">Tight Underbust:</strong>
                  <span className="block pl-4 text-xs text-slate-500">Exhale fully and pull the tape as tight as humanly possible around your ribcage. This measures your minimum skeletal circumference.</span>
                </li>
                <li className="space-y-1">
                  <strong className="text-slate-800 dark:text-slate-250">Standing / Leaning / Lying Bust:</strong>
                  <span className="block pl-4 text-xs text-slate-500">Measure around the fullest part of your breasts in three positions: standing upright, leaning forward at a 90-degree angle, and lying flat on your back. Keep the tape parallel to the floor.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* FITTING CHECKLIST */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Fit Indicators Checklist
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              When trying on a new bra in your calculated size, check these indicators to confirm a correct fit.
            </p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 space-y-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">Signs of a Perfect Fit:</span>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
                  <li>The band sits level around your ribs and does not ride up at the back.</li>
                  <li>The cups enclose your breasts fully without bulging or gaping.</li>
                  <li>The underwire rests completely flat on your ribcage behind the breast root.</li>
                  <li>The center panel (gore) lies completely flat against your sternum.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 space-y-2">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">Signs of a Bad Fit:</span>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
                  <li>Double boob effect (spilling over the top or sides of the cup).</li>
                  <li>The back band pulls up toward your neck/shoulders.</li>
                  <li>The center panel floats in the air instead of touching your chest skin.</li>
                  <li>The wires dig or poke into breast tissue near the armpits.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-violet-500" />
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
              Frequently Asked Questions (FAQ)
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Why do local markets in Bangladesh (like Gawsia, New Market) sell bras by numbers only (e.g., 36, 38) without cup sizes?",
                a: "Lingerie sold in local bazaars is mass-produced assuming a standard B cup by default. Retailers ignore cup sizes and sell only by band number. This is why many women experience poor fit—a band that is too loose combined with cups that squeeze the breast tissue. Realizing your cup size (A, B, C, D, DD) is critical even when buying locally.",
              },
              {
                q: "Which size should I buy for popular Bangladeshi brands like Aarong, Sailor, or La Reve?",
                a: "Aarong, Sailor, and other premium Bangladeshi fashion houses follow the standard US/UK sizing tables. When buying from them, check the 'UK/BD Standard' calculated by this tool (e.g., 34C, 36D) for a direct match.",
              },
              {
                q: "Why does the calculator recommend a band size smaller and cup size larger than what I normally wear?",
                a: "This is the classic effect of removing the incorrect '+4' sizing method. When you stop adding 4 inches to your underbust, your band size goes down (providing the security and lift you need), and the cup letter goes up (accommodating your breast volume). A 32D is NOT a huge cup size; it has the exact same breast volume as a 36B, but it fits a narrower ribcage correctly.",
              },
              {
                q: "Where can I buy bras with proper cup sizes (A, B, C, D+) in Bangladesh?",
                a: "You can find proper cup-sized bras at major brand showrooms (such as Aarong, Sailor, La Reve, Ecstasy, or specialty lingerie stores) or through reliable online boutique shops that import authentic UK/US/EU sizing brands.",
              },
              {
                q: "How does Assigned Sex at Birth (ASAB) affect the fit calculations?",
                a: "Individuals assigned male at birth (AMAB) who experience breast growth often have a V-shaped ribcage. Standard formulas overestimate cup sizes due to muscle and bone width on the back. Selecting 'AMAB' applies a correction index (-0.8 inches) to calculate an accurate starting cup size.",
              },
              {
                q: "How does breast shape, fullness, and projection affect fitting?",
                a: "Breasts are three-dimensional, but tape measures are two-dimensional. Projected breasts stick outward and require deep cup styles (like plunge or balconette), whereas shallow breasts spread tissue over a wider base and fit better in demi-cups. The advanced options adjust the calculation index slightly to compensate for these shapes.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between py-3 text-left font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {faqExpanded[index] ? (
                    <ChevronUp className="w-4 h-4 text-violet-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-violet-500" />
                  )}
                </button>
                {faqExpanded[index] && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </ToolPageShell>
  );
}
