/* -------------------------------------------------------------------------- */
/*  Trigonometric Function Calculator — angles, inverse functions, triangles.  */
/*  Pure maths helpers shared by the client component and the metadata page.   */
/* -------------------------------------------------------------------------- */

export const EPSILON = 1e-12;

export const ANGLE_UNITS = [
  { value: "deg", label: "Degrees" },
  { value: "rad", label: "Radians" },
  { value: "grad", label: "Gradians" },
  { value: "turn", label: "Turns" },
];

export const TRIG_FUNCTIONS = [
  { key: "sin", label: "sin", name: "Sine" },
  { key: "cos", label: "cos", name: "Cosine" },
  { key: "tan", label: "tan", name: "Tangent" },
  { key: "cot", label: "cot", name: "Cotangent" },
  { key: "sec", label: "sec", name: "Secant" },
  { key: "csc", label: "csc", name: "Cosecant" },
];

export const HYPERBOLIC_FUNCTIONS = [
  { key: "sinh", label: "sinh", name: "Hyperbolic sine" },
  { key: "cosh", label: "cosh", name: "Hyperbolic cosine" },
  { key: "tanh", label: "tanh", name: "Hyperbolic tangent" },
  { key: "coth", label: "coth", name: "Hyperbolic cotangent" },
  { key: "sech", label: "sech", name: "Hyperbolic secant" },
  { key: "csch", label: "csch", name: "Hyperbolic cosecant" },
];

export const INVERSE_FUNCTIONS = [
  { value: "asin", label: "arcsin", hint: "Input −1 to 1", domain: [-1, 1] },
  { value: "acos", label: "arccos", hint: "Input −1 to 1", domain: [-1, 1] },
  { value: "atan", label: "arctan", hint: "Any real number", domain: null },
  { value: "atan2", label: "atan2(y, x)", hint: "Any real pair", domain: null },
];

export const SPECIAL_ANGLES = [
  0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
];

const EXACT = {
  0: { sin: "0", cos: "1", tan: "0", cot: "undefined", sec: "1", csc: "undefined" },
  30: { sin: "1/2", cos: "√3/2", tan: "√3/3", cot: "√3", sec: "2√3/3", csc: "2" },
  45: { sin: "√2/2", cos: "√2/2", tan: "1", cot: "1", sec: "√2", csc: "√2" },
  60: { sin: "√3/2", cos: "1/2", tan: "√3", cot: "√3/3", sec: "2", csc: "2√3/3" },
  90: { sin: "1", cos: "0", tan: "undefined", cot: "0", sec: "undefined", csc: "1" },
  120: { sin: "√3/2", cos: "−1/2", tan: "−√3", cot: "−√3/3", sec: "−2", csc: "2√3/3" },
  135: { sin: "√2/2", cos: "−√2/2", tan: "−1", cot: "−1", sec: "−√2", csc: "√2" },
  150: { sin: "1/2", cos: "−√3/2", tan: "−√3/3", cot: "−√3", sec: "−2√3/3", csc: "2" },
  180: { sin: "0", cos: "−1", tan: "0", cot: "undefined", sec: "−1", csc: "undefined" },
  210: { sin: "−1/2", cos: "−√3/2", tan: "√3/3", cot: "√3", sec: "−2√3/3", csc: "−2" },
  225: { sin: "−√2/2", cos: "−√2/2", tan: "1", cot: "1", sec: "−√2", csc: "−√2" },
  240: { sin: "−√3/2", cos: "−1/2", tan: "√3", cot: "√3/3", sec: "−2", csc: "−2√3/3" },
  270: { sin: "−1", cos: "0", tan: "undefined", cot: "0", sec: "undefined", csc: "−1" },
  300: { sin: "−√3/2", cos: "1/2", tan: "−√3", cot: "−√3/3", sec: "2", csc: "−2√3/3" },
  315: { sin: "−√2/2", cos: "√2/2", tan: "−1", cot: "−1", sec: "√2", csc: "−√2" },
  330: { sin: "−1/2", cos: "√3/2", tan: "−√3/3", cot: "−√3", sec: "2√3/3", csc: "−2" },
};

/* -------------------------------------------------------------------------- */
/*  Unit conversion and formatting                                            */
/* -------------------------------------------------------------------------- */

export function toRadians(value, unit) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (unit === "rad") return numeric;
  if (unit === "grad") return (numeric * Math.PI) / 200;
  if (unit === "turn") return numeric * 2 * Math.PI;
  return (numeric * Math.PI) / 180;
}

export function fromRadians(radians, unit) {
  if (!Number.isFinite(radians)) return 0;
  if (unit === "rad") return radians;
  if (unit === "grad") return (radians * 200) / Math.PI;
  if (unit === "turn") return radians / (2 * Math.PI);
  return (radians * 180) / Math.PI;
}

export function normalizeDegrees(degrees) {
  const numeric = Number(degrees);
  if (!Number.isFinite(numeric)) return 0;
  return ((numeric % 360) + 360) % 360;
}

export function formatNumber(value, precision = 6) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "undefined";
  if (Math.abs(value) < 1e-12) return "0";
  const decimals = Math.max(0, Math.min(12, Number(precision) || 0));
  const rounded = Number(value.toFixed(decimals));
  if (Object.is(rounded, -0)) return "0";
  if (Math.abs(rounded) >= 1e9) return rounded.toExponential(Math.min(decimals, 6));
  return String(rounded);
}

export function formatRadiansFraction(degrees) {
  const normalized = normalizeDegrees(degrees);
  if (Math.abs(normalized - Math.round(normalized)) > 1e-9) return null;
  const whole = Math.round(normalized);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const divisor = gcd(whole, 180) || 1;
  const numerator = whole / divisor;
  const denominator = 180 / divisor;
  if (numerator === 0) return "0";
  const top = numerator === 1 ? "π" : `${numerator}π`;
  return denominator === 1 ? top : `${top}/${denominator}`;
}

export function getExactValues(degrees) {
  const normalized = normalizeDegrees(degrees);
  const nearest = SPECIAL_ANGLES.find((angle) => Math.abs(angle - normalized) < 1e-9 || Math.abs(angle - normalized - 360) < 1e-9);
  if (nearest === undefined) return null;
  return {
    angle: nearest,
    radians: formatRadiansFraction(nearest),
    values: nearest === 0 || nearest === 360 ? EXACT[0] : EXACT[nearest],
  };
}

export function angleDetails(degrees) {
  const normalized = normalizeDegrees(degrees);
  const quadrant =
    normalized === 0 || normalized === 90 || normalized === 180 || normalized === 270
      ? "On an axis"
      : normalized < 90
        ? "Quadrant I"
        : normalized < 180
          ? "Quadrant II"
          : normalized < 270
            ? "Quadrant III"
            : "Quadrant IV";

  let reference = normalized;
  if (normalized > 90 && normalized <= 180) reference = 180 - normalized;
  else if (normalized > 180 && normalized <= 270) reference = normalized - 180;
  else if (normalized > 270) reference = 360 - normalized;
  if (normalized === 90 || normalized === 270) reference = 90;
  if (normalized === 180) reference = 0;
  if (normalized === 0) reference = 0;

  const absolute = Math.abs(Number(degrees) || 0);
  const wholeDegrees = Math.floor(absolute);
  const minutesFloat = (absolute - wholeDegrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  return {
    normalized,
    quadrant,
    reference,
    complement: 90 - normalized,
    supplement: 180 - normalized,
    coterminalPositive: normalized + 360,
    coterminalNegative: normalized - 360,
    revolutions: normalized / 360,
    dms: `${degrees < 0 ? "−" : ""}${wholeDegrees}° ${minutes}′ ${seconds.toFixed(2)}″`,
    degrees,
    radians: toRadians(degrees, "deg"),
    gradians: fromRadians(toRadians(degrees, "deg"), "grad"),
    turns: fromRadians(toRadians(degrees, "deg"), "turn"),
  };
}

/* -------------------------------------------------------------------------- */
/*  Trigonometry                                                              */
/* -------------------------------------------------------------------------- */

function safeDivide(numerator, denominator) {
  return Math.abs(denominator) < EPSILON ? null : numerator / denominator;
}

export function computeTrig(radians) {
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  const tan = safeDivide(sin, cos);
  return {
    sin,
    cos,
    tan,
    cot: safeDivide(cos, sin),
    sec: safeDivide(1, cos),
    csc: safeDivide(1, sin),
  };
}

export function computeHyperbolic(radians) {
  const sinh = Math.sinh(radians);
  const cosh = Math.cosh(radians);
  return {
    sinh,
    cosh,
    tanh: Math.tanh(radians),
    coth: safeDivide(cosh, sinh),
    sech: safeDivide(1, cosh),
    csch: safeDivide(1, sinh),
  };
}

export function computeInverse(type, value, second = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return { ok: false, error: "Enter a valid number." };
  }
  if ((type === "asin" || type === "acos") && (numeric < -1 || numeric > 1)) {
    return { ok: false, error: `${type === "asin" ? "arcsin" : "arccos"} is only defined between −1 and 1.` };
  }

  let principalRad;
  let secondaryRad = null;
  if (type === "asin") {
    principalRad = Math.asin(numeric);
    secondaryRad = Math.PI - principalRad;
  } else if (type === "acos") {
    principalRad = Math.acos(numeric);
    secondaryRad = -principalRad;
  } else if (type === "atan") {
    principalRad = Math.atan(numeric);
    secondaryRad = principalRad + Math.PI;
  } else {
    const y = numeric;
    const x = Number(second);
    if (!Number.isFinite(x)) return { ok: false, error: "Enter a valid x value." };
    if (x === 0 && y === 0) return { ok: false, error: "atan2(0, 0) is undefined." };
    principalRad = Math.atan2(y, x);
    secondaryRad = null;
  }

  const toUnits = (rad) => ({
    radians: rad,
    degrees: fromRadians(rad, "deg"),
    gradians: fromRadians(rad, "grad"),
    turns: fromRadians(rad, "turn"),
  });

  return {
    ok: true,
    principal: toUnits(principalRad),
    secondary: secondaryRad === null ? null : toUnits(secondaryRad),
    type,
  };
}

/* -------------------------------------------------------------------------- */
/*  Right-triangle solver                                                     */
/* -------------------------------------------------------------------------- */

export function solveRightTriangle(input) {
  const a = Number(input.a);
  const b = Number(input.b);
  const c = Number(input.c);
  const A = Number(input.A);
  const B = Number(input.B);
  const hasA = input.a !== "" && Number.isFinite(a) && a > 0;
  const hasB = input.b !== "" && Number.isFinite(b) && b > 0;
  const hasC = input.c !== "" && Number.isFinite(c) && c > 0;
  const hasAngleA = input.A !== "" && Number.isFinite(A) && A > 0;
  const hasAngleB = input.B !== "" && Number.isFinite(B) && B > 0;

  const provided = [hasA, hasB, hasC, hasAngleA, hasAngleB].filter(Boolean).length;
  if (provided < 2) {
    return { ok: false, error: "Provide at least two values, including at least one side." };
  }
  if (!hasA && !hasB && !hasC) {
    return { ok: false, error: "Two angles only fix the shape, not the size. Add at least one side." };
  }
  if (hasAngleA && hasAngleB && Math.abs(A + B - 90) > 0.01) {
    return { ok: false, error: "In a right triangle the two acute angles must add up to 90°." };
  }

  let legA = hasA ? a : null;
  let legB = hasB ? b : null;
  let hyp = hasC ? c : null;
  let angleA = hasAngleA ? A : null;
  let angleB = hasAngleB ? B : null;

  if (angleB !== null && angleA === null) angleA = 90 - angleB;
  if (angleA !== null && angleB === null) angleB = 90 - angleA;

  if (legA && legB) {
    hyp = Math.hypot(legA, legB);
    angleA = fromRadians(Math.atan2(legA, legB), "deg");
    angleB = 90 - angleA;
  } else if (legA && hyp) {
    if (hyp <= legA) return { ok: false, error: "The hypotenuse must be longer than each leg." };
    legB = Math.sqrt(hyp * hyp - legA * legA);
    angleA = fromRadians(Math.asin(legA / hyp), "deg");
    angleB = 90 - angleA;
  } else if (legB && hyp) {
    if (hyp <= legB) return { ok: false, error: "The hypotenuse must be longer than each leg." };
    legA = Math.sqrt(hyp * hyp - legB * legB);
    angleA = fromRadians(Math.atan2(legA, legB), "deg");
    angleB = 90 - angleA;
  } else if (legA && angleA) {
    if (angleA >= 90) return { ok: false, error: "Acute angles must be between 0° and 90°." };
    const tangent = Math.tan(toRadians(angleA, "deg"));
    const sine = Math.sin(toRadians(angleA, "deg"));
    if (Math.abs(tangent) < EPSILON || Math.abs(sine) < EPSILON) {
      return { ok: false, error: "Angle A is too small to produce a finite triangle." };
    }
    legB = legA / tangent;
    hyp = legA / sine;
    angleB = 90 - angleA;
  } else if (legB && angleA) {
    const tangent = Math.tan(toRadians(angleA, "deg"));
    const cosine = Math.cos(toRadians(angleA, "deg"));
    if (Math.abs(cosine) < EPSILON) {
      return { ok: false, error: "Angle A is too close to 90° for this side combination." };
    }
    legA = legB * tangent;
    hyp = legB / cosine;
    angleB = 90 - angleA;
  } else if (hyp && angleA) {
    const sine = Math.sin(toRadians(angleA, "deg"));
    const cosine = Math.cos(toRadians(angleA, "deg"));
    legA = hyp * sine;
    legB = hyp * cosine;
    angleB = 90 - angleA;
  } else {
    return { ok: false, error: "These values are not enough to solve the triangle." };
  }

  if (![legA, legB, hyp, angleA, angleB].every((value) => Number.isFinite(value) && value > 0)) {
    return { ok: false, error: "The values do not describe a valid right triangle." };
  }
  if (angleA >= 90 || angleB >= 90) {
    return { ok: false, error: "The acute angles must be smaller than 90°." };
  }

  const area = (legA * legB) / 2;
  const perimeter = legA + legB + hyp;
  const altitude = (legA * legB) / hyp;
  const inradius = (legA + legB - hyp) / 2;
  const circumradius = hyp / 2;
  const isosceles = Math.abs(legA - legB) <= 1e-7 * hyp;
  const integerSides = [legA, legB, hyp].every((side) => Math.abs(side - Math.round(side)) < 1e-7);
  const triple = integerSides
    ? `${Math.round(legA)}-${Math.round(legB)}-${Math.round(hyp)}`
    : null;

  return {
    ok: true,
    a: legA,
    b: legB,
    c: hyp,
    A: angleA,
    B: angleB,
    C: 90,
    area,
    perimeter,
    altitude,
    inradius,
    circumradius,
    isosceles,
    triple,
    classification: isosceles ? "Isosceles right triangle" : "Scalene right triangle",
  };
}

/* -------------------------------------------------------------------------- */
/*  Reference table                                                           */
/* -------------------------------------------------------------------------- */

export const SPECIAL_ANGLE_TABLE = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330].map(
  (degrees) => {
    const exact = getExactValues(degrees);
    return {
      degrees,
      radians: formatRadiansFraction(degrees),
      sin: exact.values.sin,
      cos: exact.values.cos,
      tan: exact.values.tan,
    };
  },
);

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const TRIG_FAQS = [
  {
    question: "What is a trigonometric function calculator?",
    answer:
      "It evaluates the six trigonometric functions — sine, cosine, tangent, cotangent, secant and cosecant — for an angle. This calculator accepts degrees, radians, gradians and turns, shows exact values for special angles, and can also solve inverse functions and right triangles.",
  },
  {
    question: "Why is tan(90°) undefined?",
    answer:
      "Tangent is sine divided by cosine. At 90° the cosine is zero, so the division has no finite result. The same happens for secant at 90° and 270°, and for cotangent and cosecant at 0°, 180° and 360°.",
  },
  {
    question: "What is a reference angle?",
    answer:
      "The reference angle is the acute angle between the terminal side of your angle and the nearest horizontal axis. It lets you reuse the exact values of the first quadrant with the correct sign for the quadrant you are in.",
  },
  {
    question: "How do radians and degrees differ?",
    answer:
      "A full turn is 360° or 2π radians. Radians are dimensionless and are the natural unit in calculus, while degrees are convenient for geometry. Multiply degrees by π/180 to get radians, and radians by 180/π to get degrees.",
  },
  {
    question: "How does the right-triangle solver work?",
    answer:
      "Enter any two values, including at least one side. The solver uses the Pythagorean theorem, sine, cosine and tangent to derive the remaining sides and acute angles. It also reports area, perimeter, altitude, inradius and circumradius.",
  },
  {
    question: "Is this trigonometric calculator free?",
    answer:
      "Yes. Every calculation runs locally in your browser with no account, upload or server request. You can use it offline after the page has loaded.",
  },
];
