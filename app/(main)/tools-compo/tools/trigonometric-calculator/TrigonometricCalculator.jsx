"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  CircleDot,
  Compass,
  Download,
  Hash,
  Info,
  Ruler,
  Sigma,
  Table2,
  Triangle,
  Waves,
  RotateCcw,
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
  ANGLE_UNITS,
  HYPERBOLIC_FUNCTIONS,
  INVERSE_FUNCTIONS,
  SPECIAL_ANGLE_TABLE,
  TRIG_FAQS,
  TRIG_FUNCTIONS,
  angleDetails,
  computeHyperbolic,
  computeInverse,
  computeTrig,
  formatNumber,
  formatRadiansFraction,
  fromRadians,
  getExactValues,
  solveRightTriangle,
  toRadians,
} from "./trigData";

const TOOL_META = {
  title: "Trigonometric Function Calculator",
  link: "/tools/trigonometric-calculator",
  icon: "TriangleRight",
};

const TONE = "sky";

const TABS = [
  { value: "functions", label: "Functions", icon: Waves },
  { value: "inverse", label: "Inverse", icon: RotateCcw },
  { value: "triangle", label: "Triangle", icon: Triangle },
  { value: "learn", label: "Learn", icon: BookOpen },
];

const QUICK_ANGLES = [0, 30, 45, 60, 90, 120, 180, 270, 360];

const DEFAULT_TRIANGLE = { a: "3", b: "4", c: "", A: "", B: "" };

function UnitCircle({ degrees }) {
  const normalized = ((degrees % 360) + 360) % 360;
  const radians = (normalized * Math.PI) / 180;
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 125;
  const x = cx + radius * Math.cos(radians);
  const y = cy - radius * Math.sin(radians);
  const largeArc = normalized > 180 ? 1 : 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Unit circle at ${normalized} degrees`} className="mx-auto w-full max-w-[340px]">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-700" />
      <line x1={cx - radius - 18} y1={cy} x2={cx + radius + 18} y2={cy} stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700" />
      <line x1={cx} y1={cy - radius - 18} x2={cx} y2={cy + radius + 18} stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700" />
      {normalized > 0.01 && (
        <path
          d={`M ${cx} ${cy} L ${cx + radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 0 ${x} ${y} Z`}
          fill="currentColor"
          className="text-sky-500/15"
        />
      )}
      <path
        d={`M ${cx + radius} ${cy} A ${radius} ${radius} 0 ${largeArc} 0 ${x} ${y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-sky-500"
      />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeWidth="2.5" className="text-sky-600 dark:text-sky-400" />
      <line x1={x} y1={y} x2={x} y2={cy} strokeDasharray="5 4" stroke="currentColor" strokeWidth="1.5" className="text-violet-500" />
      <line x1={x} y1={y} x2={cx} y2={y} strokeDasharray="5 4" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500" />
      <circle cx={x} cy={y} r="6" fill="currentColor" className="text-sky-600 dark:text-sky-400" />
      <text x={cx + radius + 10} y={cy + 5} fontSize="13" fill="currentColor" className="text-slate-500 dark:text-slate-400">0°</text>
      <text x={cx - 6} y={cy - radius - 10} fontSize="13" fill="currentColor" className="text-slate-500 dark:text-slate-400">90°</text>
      <text x={cx - radius - 30} y={cy + 5} fontSize="13" fill="currentColor" className="text-slate-500 dark:text-slate-400">180°</text>
      <text x={cx - 6} y={cy + radius + 20} fontSize="13" fill="currentColor" className="text-slate-500 dark:text-slate-400">270°</text>
      <text x={cx + 28} y={cy + radius - 10} fontSize="14" fontWeight="700" fill="currentColor" className="text-sky-700 dark:text-sky-300">
        {(Math.cos(radians)).toFixed(2)}, {(Math.sin(radians)).toFixed(2)}
      </text>
    </svg>
  );
}

function TriangleDiagram({ triangle }) {
  const width = 380;
  const height = 260;
  const pad = 42;
  const scale = Math.min((width - 2 * pad) / triangle.a, (height - 2 * pad) / triangle.b);
  const cX = pad;
  const cY = height - pad;
  const bX = cX + triangle.a * scale;
  const bY = cY;
  const aX = cX;
  const aY = cY - triangle.b * scale;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Solved right triangle" className="mx-auto w-full max-w-[420px]">
      <path
        d={`M ${cX} ${cY} L ${bX} ${bY} L ${aX} ${aY} Z`}
        fill="currentColor"
        className="text-sky-500/10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d={`M ${cX} ${cY} L ${cX + 16} ${cY} L ${cX + 16} ${cY - 16}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-slate-400 dark:text-slate-500"
      />
      <circle cx={cX} cy={cY} r="3.5" fill="currentColor" className="text-slate-600 dark:text-slate-300" />
      <circle cx={bX} cy={bY} r="3.5" fill="currentColor" className="text-slate-600 dark:text-slate-300" />
      <circle cx={aX} cy={aY} r="3.5" fill="currentColor" className="text-slate-600 dark:text-slate-300" />
      <text x={(aX + bX) / 2 + 10} y={(aY + bY) / 2 - 8} fontSize="15" fontWeight="700" fill="currentColor" className="text-sky-700 dark:text-sky-300">
        c = {triangle.c.toFixed(2)}
      </text>
      <text x={(cX + bX) / 2 - 8} y={cY + 24} fontSize="15" fontWeight="700" fill="currentColor" className="text-emerald-700 dark:text-emerald-300">
        a = {triangle.a.toFixed(2)}
      </text>
      <text x={cX - 62} y={(cY + aY) / 2} fontSize="15" fontWeight="700" fill="currentColor" className="text-violet-700 dark:text-violet-300">
        b = {triangle.b.toFixed(2)}
      </text>
      <text x={aX - 22} y={aY + 5} fontSize="15" fontWeight="800" fill="currentColor" className="text-slate-700 dark:text-slate-200">A</text>
      <text x={bX + 6} y={bY + 6} fontSize="15" fontWeight="800" fill="currentColor" className="text-slate-700 dark:text-slate-200">B</text>
      <text x={cX - 20} y={cY + 22} fontSize="15" fontWeight="800" fill="currentColor" className="text-slate-700 dark:text-slate-200">C</text>
      <text x={(aX + bX) / 2 - 38} y={aY - 8} fontSize="13" fill="currentColor" className="text-slate-500 dark:text-slate-400">
        A = {triangle.A.toFixed(1)}°
      </text>
      <text x={bX - 52} y={bY - 12} fontSize="13" fill="currentColor" className="text-slate-500 dark:text-slate-400">
        B = {triangle.B.toFixed(1)}°
      </text>
    </svg>
  );
}

export default function TrigonometricCalculator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("functions");
  const [angleInput, setAngleInput] = useState("30");
  const [unit, setUnit] = useState("deg");
  const [precision, setPrecision] = useState(4);
  const [hyperbolic, setHyperbolic] = useState(false);
  const [inverseType, setInverseType] = useState("asin");
  const [inverseValue, setInverseValue] = useState("0.5");
  const [inverseSecond, setInverseSecond] = useState("1");
  const [triangleInput, setTriangleInput] = useState(DEFAULT_TRIANGLE);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const degrees = useMemo(() => {
    if (unit === "deg") return Number(angleInput) || 0;
    return fromRadians(toRadians(angleInput, unit), "deg");
  }, [angleInput, unit]);

  const radians = useMemo(() => toRadians(angleInput, unit), [angleInput, unit]);
  const trig = useMemo(() => computeTrig(radians), [radians]);
  const hyper = useMemo(() => computeHyperbolic(radians), [radians]);
  const details = useMemo(() => angleDetails(degrees), [degrees]);
  const exact = useMemo(() => getExactValues(degrees), [degrees]);
  const inverse = useMemo(
    () => computeInverse(inverseType, inverseValue, inverseSecond),
    [inverseType, inverseValue, inverseSecond],
  );
  const triangle = useMemo(() => solveRightTriangle(triangleInput), [triangleInput]);

  const setTriangleValue = (key, value) =>
    setTriangleInput((current) => ({ ...current, [key]: value }));

  const resetAngle = () => {
    setAngleInput("30");
    setUnit("deg");
    setPrecision(4);
    setHyperbolic(false);
    toast.success("Angle settings reset.");
  };

  const loadExample = (kind) => {
    if (kind === "345") {
      setTriangleInput({ a: "3", b: "4", c: "", A: "", B: "" });
      toast.success("Loaded the classic 3–4–5 triangle.");
    } else if (kind === "4545") {
      setTriangleInput({ a: "1", b: "1", c: "", A: "", B: "" });
      toast.success("Loaded an isosceles right triangle.");
    } else {
      setTriangleInput({ a: "", b: "", c: "", A: "", B: "" });
      toast.success("Triangle cleared.");
    }
  };

  const downloadTrig = () => {
    const lines = [
      "ToolsTrek Trigonometric Function Calculator",
      `Angle: ${formatNumber(degrees, precision)}°`,
      `Radians: ${formatNumber(radians, precision)} rad`,
      `Gradians: ${formatNumber(fromRadians(radians, "grad"), precision)} gon`,
      `Turns: ${formatNumber(fromRadians(radians, "turn"), precision)}`,
      "",
      ...TRIG_FUNCTIONS.map(
        (fn) =>
          `${fn.key}(${formatNumber(degrees, precision)}°) = ${
            trig[fn.key] === null ? "undefined" : formatNumber(trig[fn.key], precision)
          }`,
      ),
      "",
      `Quadrant: ${details.quadrant}`,
      `Reference angle: ${formatNumber(details.reference, precision)}°`,
      `Complement: ${formatNumber(details.complement, precision)}°`,
      `Supplement: ${formatNumber(details.supplement, precision)}°`,
      exact ? `Exact form: sin ${exact.values.sin}, cos ${exact.values.cos}, tan ${exact.values.tan}` : "",
    ].filter(Boolean);
    downloadText(lines.join("\n"), "trigonometry-results.txt");
    toast.success("Results downloaded as text.");
  };

  const angleText = `${formatNumber(degrees, precision)}° = ${formatNumber(radians, precision)} rad`;

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Angle & triangle studio"
        icon={Compass}
        title="Trigonometric Function Calculator"
        description="Evaluate all six trigonometric functions in degrees, radians, gradians or turns. See exact values for special angles, explore inverse functions, solve right triangles and visualise everything on the unit circle."
        badges={[
          "Six trig functions",
          "Four angle units",
          "Exact special values",
          "Inverse & atan2",
          "Right-triangle solver",
          "Unit circle diagram",
        ]}
      />

      <div
        role="tablist"
        aria-label="Trigonometry sections"
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
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === "functions" && (
        <>
          <SectionCard
            tone={TONE}
            icon={Compass}
            title="Angle input"
            description="Choose a unit, type an angle and every function updates immediately."
            actions={
              <ActionButton icon={RotateCcw} variant="ghost" onClick={resetAngle}>
                Reset
              </ActionButton>
            }
          >
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Segmented
                  label="Angle unit"
                  tone={TONE}
                  columns={4}
                  value={unit}
                  onChange={setUnit}
                  options={ANGLE_UNITS}
                />
              </div>
              <div className="lg:col-span-7">
                <Field
                  label={`Angle in ${ANGLE_UNITS.find((item) => item.value === unit)?.label.toLowerCase()}`}
                  htmlFor="trig-angle"
                  hint={`${angleText} · ${details.dms}`}
                >
                  <input
                    id="trig-angle"
                    value={angleInput}
                    onChange={(event) => setAngleInput(event.target.value)}
                    inputMode="decimal"
                    className={`${fieldClass(false, TONE)} h-14 text-lg font-bold tabular-nums`}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_ANGLES.map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => {
                    setUnit("deg");
                    setAngleInput(String(angle));
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                >
                  {angle}°
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Stat tone={TONE} label="Degrees" value={`${formatNumber(degrees, precision)}°`} icon={Hash} />
              <Stat tone={TONE} label="Radians" value={formatNumber(radians, precision)} icon={Sigma} />
              <Stat tone={TONE} label="Gradians" value={formatNumber(details.gradians, precision)} icon={Ruler} />
              <Stat tone={TONE} label="Turns" value={formatNumber(details.turns, precision)} icon={RotateCcw} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip tone={TONE}>{details.quadrant}</Chip>
              <Chip tone="violet">reference {formatNumber(details.reference, 2)}°</Chip>
              {formatRadiansFraction(degrees) && <Chip tone="emerald">{formatRadiansFraction(degrees)} rad exact</Chip>}
              {exact && <Chip tone="amber">special angle</Chip>}
            </div>
          </SectionCard>

          <SectionCard
            tone={TONE}
            icon={Waves}
            title="Six trigonometric functions"
            description="Values are rounded for display. Hover or copy the exact form when the angle is special."
            actions={<CopyButton text={angleText} tone={TONE} label="Copy angle" />}
          >
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {TRIG_FUNCTIONS.map((fn) => {
                const value = trig[fn.key];
                const exactValue = exact?.values?.[fn.key];
                return (
                  <div
                    key={fn.key}
                    className={`rounded-2xl border p-4 transition ${
                      value === null
                        ? "border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {fn.name}
                        </p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-sky-700 dark:text-sky-300">
                          {fn.key}(θ)
                        </p>
                      </div>
                      <CopyButton
                        text={value === null ? "undefined" : formatNumber(value, Math.max(precision, 6))}
                        tone={TONE}
                        label="Copy"
                      />
                    </div>
                    <p className="mt-3 break-all text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
                      {value === null ? "undefined" : formatNumber(value, precision)}
                    </p>
                    {exactValue ? (
                      <p className="mt-1 text-sm font-semibold text-sky-600 dark:text-sky-400">exact: {exactValue}</p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                        {value === null ? "division by zero at this angle" : "approximate value"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {exact && (
              <div className="mt-4">
                <Callout tone={TONE} variant="tip" title={`Exact values for ${exact.angle}° (${exact.radians} rad)`}>
                  sin = {exact.values.sin} · cos = {exact.values.cos} · tan = {exact.values.tan} · cot ={" "}
                  {exact.values.cot} · sec = {exact.values.sec} · csc = {exact.values.csc}
                </Callout>
              </div>
            )}

            <div className="mt-4">
              <SliderRow
                tone={TONE}
                label="Decimal precision"
                min={0}
                max={10}
                step={1}
                value={precision}
                onChange={setPrecision}
                format={(value) => `${value} dp`}
                hint="Exact values ignore this setting."
                onReset={() => setPrecision(4)}
              />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="xl:col-span-5">
              <SectionCard tone={TONE} icon={CircleDot} title="Unit circle" description="The blue point is (cos θ, sin θ). Dashed lines show the projections.">
                <UnitCircle degrees={degrees} />
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Chip tone="emerald">cos θ = {formatNumber(trig.cos, precision)}</Chip>
                  <Chip tone="violet">sin θ = {formatNumber(trig.sin, precision)}</Chip>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6 xl:col-span-7">
              <SectionCard tone={TONE} icon={Compass} title="Angle anatomy" description="Everything derived from the same angle.">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Stat tone={TONE} label="Quadrant" value={details.quadrant} />
                  <Stat tone={TONE} label="Reference angle" value={`${formatNumber(details.reference, precision)}°`} />
                  <Stat tone={TONE} label="Complement (90° − θ)" value={`${formatNumber(details.complement, precision)}°`} />
                  <Stat tone={TONE} label="Supplement (180° − θ)" value={`${formatNumber(details.supplement, precision)}°`} />
                  <Stat tone={TONE} label="Co-terminal +360°" value={`${formatNumber(details.coterminalPositive, precision)}°`} />
                  <Stat tone={TONE} label="Co-terminal −360°" value={`${formatNumber(details.coterminalNegative, precision)}°`} />
                </div>
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                  Normalised angle: <strong>{formatNumber(details.normalized, precision)}°</strong> · Degrees-minutes-seconds:{" "}
                  <strong>{details.dms}</strong> · Revolutions: <strong>{formatNumber(details.revolutions, 4)}</strong>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton text={angleText} tone={TONE} label="Copy angle" />
                  <ActionButton icon={Download} onClick={downloadTrig}>
                    Download results
                  </ActionButton>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Waves} title="Hyperbolic functions" description="Useful for calculus, differential equations and engineering models.">
                <ToggleRow
                  tone={TONE}
                  checked={hyperbolic}
                  onChange={setHyperbolic}
                  label="Show hyperbolic values"
                  description="sinh, cosh, tanh, coth, sech and csch for the same angle."
                />
                {hyperbolic && (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {HYPERBOLIC_FUNCTIONS.map((fn) => (
                      <div key={fn.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{fn.name}</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{fn.key}(θ)</p>
                        <p className="mt-1 text-lg font-black tabular-nums text-slate-900 dark:text-white">
                          {hyper[fn.key] === null ? "undefined" : formatNumber(hyper[fn.key], precision)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "inverse" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={RotateCcw}
            title="Inverse trigonometric functions"
            description="Find the angle that produces a given ratio. Principal values follow the standard ranges."
          >
            <Segmented
              tone={TONE}
              label="Function"
              columns={4}
              value={inverseType}
              onChange={setInverseType}
              options={INVERSE_FUNCTIONS.map((fn) => ({ value: fn.value, label: fn.label }))}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label={inverseType === "atan2" ? "y value" : "Ratio value"}
                htmlFor="inverse-value"
                hint={INVERSE_FUNCTIONS.find((fn) => fn.value === inverseType)?.hint}
              >
                <input
                  id="inverse-value"
                  value={inverseValue}
                  onChange={(event) => setInverseValue(event.target.value)}
                  inputMode="decimal"
                  className={`${fieldClass(!inverse.ok, TONE)} h-12 text-base font-bold tabular-nums`}
                />
              </Field>
              {inverseType === "atan2" ? (
                <Field label="x value" htmlFor="inverse-second" hint="atan2(y, x) returns the angle of the point (x, y)">
                  <input
                    id="inverse-second"
                    value={inverseSecond}
                    onChange={(event) => setInverseSecond(event.target.value)}
                    inputMode="decimal"
                    className={`${fieldClass(!inverse.ok, TONE)} h-12 text-base font-bold tabular-nums`}
                  />
                </Field>
              ) : (
                <Field label="Quick values" htmlFor="inverse-quick" hint="Common ratios to try">
                  <div id="inverse-quick" className="flex flex-wrap gap-2">
                    {["-1", "-0.5", "0", "0.5", "1"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setInverseValue(value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </div>

            {!inverse.ok && <FieldError>{inverse.error}</FieldError>}
          </SectionCard>

          {inverse.ok ? (
            <>
              <SectionCard
                tone={TONE}
                icon={CheckCircle2}
                title="Principal result"
                description="This is the standard single-valued answer returned by calculators and programming languages."
                actions={<CopyButton text={`${formatNumber(inverse.principal.degrees, precision)}° = ${formatNumber(inverse.principal.radians, precision)} rad`} tone={TONE} label="Copy result" />}
              >
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <Stat tone={TONE} label="Degrees" value={`${formatNumber(inverse.principal.degrees, precision)}°`} icon={Hash} />
                  <Stat tone={TONE} label="Radians" value={formatNumber(inverse.principal.radians, precision)} icon={Sigma} />
                  <Stat tone={TONE} label="Gradians" value={formatNumber(inverse.principal.gradians, precision)} icon={Ruler} />
                  <Stat tone={TONE} label="Turns" value={formatNumber(inverse.principal.turns, precision)} icon={RotateCcw} />
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Verification</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {inverseType === "atan2"
                      ? `The point (${inverseSecond}, ${inverseValue}) sits at ${formatNumber(inverse.principal.degrees, precision)}° from the positive x-axis.`
                      : `Using ${inverseType === "asin" ? "sine" : inverseType === "acos" ? "cosine" : "tangent"} on this angle returns ${formatNumber(
                          inverseType === "asin"
                            ? Math.sin(inverse.principal.radians)
                            : inverseType === "acos"
                              ? Math.cos(inverse.principal.radians)
                              : Math.tan(inverse.principal.radians),
                          precision,
                        )}.`}
                  </p>
                </div>
              </SectionCard>

              {inverse.secondary && (
                <SectionCard tone={TONE} icon={ArrowLeftRight} title="Secondary solution" description="Trigonometric equations usually have more than one angle in a full turn.">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <Stat tone={TONE} label="Degrees" value={`${formatNumber(inverse.secondary.degrees, precision)}°`} />
                    <Stat tone={TONE} label="Radians" value={formatNumber(inverse.secondary.radians, precision)} />
                    <Stat tone={TONE} label="Gradians" value={formatNumber(inverse.secondary.gradians, precision)} />
                    <Stat tone={TONE} label="Turns" value={formatNumber(inverse.secondary.turns, precision)} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Add or subtract 360° (2π radians) to either answer to generate every co-terminal solution.
                  </p>
                </SectionCard>
              )}

              <div className="grid gap-6 lg:grid-cols-3">
                <Callout tone={TONE} variant="info" title="arcsin range">
                  −90° to 90°, or −π/2 to π/2.
                </Callout>
                <Callout tone={TONE} variant="info" title="arccos range">
                  0° to 180°, or 0 to π.
                </Callout>
                <Callout tone={TONE} variant="info" title="arctan range">
                  −90° to 90°, excluding the endpoints.
                </Callout>
              </div>
            </>
          ) : (
            <SectionCard tone="amber" icon={AlertTriangle} title="Check the input">
              <Callout tone="amber" variant="warning" title="Outside the domain">
                {inverse.error}
              </Callout>
            </SectionCard>
          )}
        </div>
      )}

      {tab === "triangle" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={Triangle}
            title="Right-triangle solver"
            description="Fill in any two values — at least one side. The remaining sides and angles are solved with the Pythagorean theorem and basic trigonometry."
            actions={
              <>
                <ActionButton onClick={() => loadExample("345")}>3–4–5 example</ActionButton>
                <ActionButton onClick={() => loadExample("4545")}>45–45–90</ActionButton>
                <ActionButton icon={RotateCcw} variant="ghost" onClick={() => loadExample("clear")}>
                  Clear
                </ActionButton>
              </>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { key: "a", label: "Side a", hint: "Opposite angle A" },
                { key: "b", label: "Side b", hint: "Opposite angle B" },
                { key: "c", label: "Hypotenuse c", hint: "Opposite the right angle" },
                { key: "A", label: "Angle A (°)", hint: "Acute angle" },
                { key: "B", label: "Angle B (°)", hint: "Acute angle" },
              ].map((field) => (
                <Field key={field.key} label={field.label} htmlFor={`triangle-${field.key}`} hint={field.hint}>
                  <input
                    id={`triangle-${field.key}`}
                    value={triangleInput[field.key]}
                    onChange={(event) => setTriangleValue(field.key, event.target.value)}
                    inputMode="decimal"
                    placeholder="—"
                    className={`${fieldClass(false, TONE)} tabular-nums`}
                  />
                </Field>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone={TONE}>a² + b² = c²</Chip>
              <Chip tone="violet">A + B = 90°</Chip>
              <Chip tone="emerald">right angle at C</Chip>
            </div>
          </SectionCard>

          {triangle.ok ? (
            <>
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
                <div className="xl:col-span-5">
                  <SectionCard tone={TONE} icon={Triangle} title="Triangle diagram" description={`${triangle.classification}${triangle.triple ? ` · ${triangle.triple} triple` : ""}.`}>
                    <TriangleDiagram triangle={triangle} />
                  </SectionCard>
                </div>
                <div className="space-y-6 xl:col-span-7">
                  <SectionCard tone={TONE} icon={Ruler} title="Sides and angles" description="Solved values, rounded to the selected precision.">
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      <Stat tone={TONE} label="Side a" value={formatNumber(triangle.a, precision)} />
                      <Stat tone={TONE} label="Side b" value={formatNumber(triangle.b, precision)} />
                      <Stat tone={TONE} label="Hypotenuse c" value={formatNumber(triangle.c, precision)} />
                      <Stat tone={TONE} label="Angle A" value={`${formatNumber(triangle.A, precision)}°`} />
                      <Stat tone={TONE} label="Angle B" value={`${formatNumber(triangle.B, precision)}°`} />
                      <Stat tone={TONE} label="Angle C" value="90°" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <CopyButton
                        text={`a=${formatNumber(triangle.a, precision)}, b=${formatNumber(triangle.b, precision)}, c=${formatNumber(triangle.c, precision)}, A=${formatNumber(triangle.A, precision)}°, B=${formatNumber(triangle.B, precision)}°`}
                        tone={TONE}
                        label="Copy triangle"
                      />
                      <Chip tone={TONE}>{triangle.classification}</Chip>
                      {triangle.triple && <Chip tone="emerald">Pythagorean triple {triangle.triple}</Chip>}
                    </div>
                  </SectionCard>

                  <SectionCard tone={TONE} icon={Calculator} title="Derived measurements">
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      <Stat tone={TONE} label="Area" value={formatNumber(triangle.area, precision)} />
                      <Stat tone={TONE} label="Perimeter" value={formatNumber(triangle.perimeter, precision)} />
                      <Stat tone={TONE} label="Altitude to c" value={formatNumber(triangle.altitude, precision)} />
                      <Stat tone={TONE} label="Inradius" value={formatNumber(triangle.inradius, precision)} />
                      <Stat tone={TONE} label="Circumradius" value={formatNumber(triangle.circumradius, precision)} />
                      <Stat tone={TONE} label="Median to c" value={formatNumber(triangle.circumradius, precision)} />
                    </div>
                  </SectionCard>
                </div>
              </div>

              <SectionCard tone={TONE} icon={Info} title="How the solution was found">
                <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-sky-300 dark:bg-slate-950">
                  c = √(a² + b²) = √({formatNumber(triangle.a, 2)}² + {formatNumber(triangle.b, 2)}²) ={" "}
                  {formatNumber(triangle.c, 4)}
                  <br />
                  A = arctan(a / b) = {formatNumber(triangle.A, 4)}°
                  <br />
                  B = 90° − A = {formatNumber(triangle.B, 4)}°
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  When you provide a side and an angle instead, the solver selects sine, cosine or tangent based on
                  which ratio links the known values. Angles outside 0°–90° and side combinations that violate the
                  triangle inequality are rejected.
                </p>
              </SectionCard>
            </>
          ) : (
            <SectionCard tone="amber" icon={AlertTriangle} title="Cannot solve yet">
              <Callout tone="amber" variant="warning" title="Try a different combination">
                {triangle.error}
              </Callout>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                  <p className="font-bold">Works</p>
                  <p className="mt-1">Two sides · one side + one angle · three sides (valid right triangle).</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                  <p className="font-bold">Does not work</p>
                  <p className="mt-1">Two angles without a side · one value only · angles that do not add to 90°.</p>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Pythagorean identity",
                formula: "sin²θ + cos²θ = 1",
                body: "The fundamental link between sine and cosine. It follows directly from the unit circle.",
              },
              {
                title: "Reciprocal identities",
                formula: "csc = 1/sin · sec = 1/cos · cot = 1/tan",
                body: "The three reciprocal functions are undefined wherever their denominator is zero.",
              },
              {
                title: "Quotient identities",
                formula: "tan = sin/cos · cot = cos/sin",
                body: "Tangent and cotangent express the slope of the terminal side of the angle.",
              },
              {
                title: "Cofunction identities",
                formula: "sin(90° − θ) = cos θ",
                body: "Complementary angles share values: cosine is the sine of the complement.",
              },
              {
                title: "Even and odd",
                formula: "sin(−θ) = −sin θ · cos(−θ) = cos θ",
                body: "Cosine is even; sine and tangent are odd. This explains sign changes across quadrants.",
              },
              {
                title: "Degrees and radians",
                formula: "180° = π rad · 360° = 2π rad",
                body: "Radians measure arc length on a unit circle. One radian is about 57.2958°.",
              },
            ].map((item) => (
              <SectionCard key={item.title} tone={TONE} icon={Sigma} title={item.title}>
                <div className="rounded-xl bg-slate-900 p-3.5 text-center font-mono text-sm leading-relaxed text-sky-300 dark:bg-slate-950">
                  {item.formula}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.body}</p>
              </SectionCard>
            ))}
          </div>

          <SectionCard tone={TONE} icon={Table2} title="Special angle reference" description="Exact sine, cosine and tangent values for the standard angles.">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3.5 py-3 font-bold">Degrees</th>
                    <th className="px-3.5 py-3 font-bold">Radians</th>
                    <th className="px-3.5 py-3 font-bold">sin θ</th>
                    <th className="px-3.5 py-3 font-bold">cos θ</th>
                    <th className="px-3.5 py-3 font-bold">tan θ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {SPECIAL_ANGLE_TABLE.map((row) => (
                    <tr key={row.degrees} className="transition hover:bg-sky-50/40 dark:hover:bg-sky-950/20">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white">{row.degrees}°</td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-300">{row.radians}</td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-700 dark:text-slate-200">{row.sin}</td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-700 dark:text-slate-200">{row.cos}</td>
                      <td className="px-3.5 py-2.5 font-mono text-slate-700 dark:text-slate-200">{row.tan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Special angles are multiples of 30° and 45°. Their values can be written exactly with square roots,
              which is why the calculator shows both an exact form and a decimal.
            </p>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone={TONE} variant="tip" title="Mind the quadrant">
              The reference angle gives the size; the quadrant gives the sign. The same reference angle can produce
              positive or negative values.
            </Callout>
            <Callout tone="amber" variant="warning" title="Undefined is not zero">
              tan 90° and csc 0° have no finite value. The calculator labels them undefined instead of returning a huge
              rounded number.
            </Callout>
            <Callout tone="emerald" variant="success" title="Check your mode">
              Always confirm degrees versus radians before trusting a result — the same number means a very different
              angle in each unit.
            </Callout>
          </div>

          <FaqAccordion items={TRIG_FAQS} tone={TONE} title="Trigonometry questions, answered" />
        </div>
      )}
    </div>
  );
}
