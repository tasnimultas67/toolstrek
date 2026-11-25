/* -------------------------------------------------------------------------- */
/*  Matrix Generator — deterministic generation, formatting and analysis.      */
/*  Everything here is pure JavaScript so it can run during prerendering.      */
/* -------------------------------------------------------------------------- */

export const MAX_SIZE = 12;
export const MAX_SEED = 999999999;

export const STRUCTURES = [
  { value: "random", label: "Random" },
  { value: "identity", label: "Identity" },
  { value: "zeros", label: "Zero" },
  { value: "ones", label: "Ones" },
  { value: "diagonal", label: "Diagonal" },
  { value: "upper", label: "Upper triangular" },
  { value: "lower", label: "Lower triangular" },
  { value: "symmetric", label: "Symmetric" },
  { value: "skew", label: "Skew-symmetric" },
  { value: "sparse", label: "Sparse" },
  { value: "banded", label: "Banded" },
  { value: "toeplitz", label: "Toeplitz" },
];

export const OUTPUT_FORMATS = [
  { value: "brackets", label: "Brackets" },
  { value: "plain", label: "Plain" },
  { value: "csv", label: "CSV" },
  { value: "latex", label: "LaTeX" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "matlab", label: "MATLAB" },
  { value: "markdown", label: "Markdown" },
];

export const PRESETS = [
  { label: "2 × 2", rows: 2, cols: 2, structure: "random" },
  { label: "3 × 3", rows: 3, cols: 3, structure: "random" },
  { label: "4 × 4", rows: 4, cols: 4, structure: "random" },
  { label: "Identity 4", rows: 4, cols: 4, structure: "identity" },
  { label: "Symmetric 5", rows: 5, cols: 5, structure: "symmetric" },
  { label: "Sparse 6", rows: 6, cols: 6, structure: "sparse" },
];

export const DEFAULT_SETTINGS = {
  rows: 3,
  cols: 3,
  structure: "random",
  min: -9,
  max: 9,
  decimals: 0,
  density: 35,
  bandwidth: 1,
  diagonalDominance: false,
};

export const DEFAULT_DISPLAY = {
  format: "brackets",
  precision: 3,
  showHeaders: true,
  editable: true,
};

/* -------------------------------------------------------------------------- */
/*  Seeded random numbers                                                     */
/* -------------------------------------------------------------------------- */

export function createRng(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed() {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % MAX_SEED;
  }
  return Math.floor(Math.random() * MAX_SEED);
}

function roundTo(value, decimals) {
  const factor = 10 ** Math.max(0, Math.min(10, Number(decimals) || 0));
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function randomInRange(rng, min, max, decimals) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return roundTo(low + rng() * (high - low), decimals);
}

function scaleBounds(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1e9, Math.min(1e9, value));
}

/* -------------------------------------------------------------------------- */
/*  Generation                                                                */
/* -------------------------------------------------------------------------- */

export function generateMatrix(settings, seed) {
  const rows = Math.max(1, Math.min(MAX_SIZE, Math.round(Number(settings.rows) || 1)));
  const cols = Math.max(1, Math.min(MAX_SIZE, Math.round(Number(settings.cols) || 1)));
  const min = scaleBounds(Number(settings.min));
  const max = scaleBounds(Number(settings.max));
  const decimals = Math.max(0, Math.min(6, Number(settings.decimals) || 0));
  const density = Math.max(5, Math.min(100, Number(settings.density) || 35));
  const bandwidth = Math.max(0, Math.min(MAX_SIZE - 1, Number(settings.bandwidth) || 0));
  const rng = createRng(seed);
  const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));

  const fill = () => randomInRange(rng, min, max, decimals);
  const structure = settings.structure;

  if (structure === "identity") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) matrix[r][c] = r === c ? 1 : 0;
    }
  } else if (structure === "zeros") {
    // Already zero-filled.
  } else if (structure === "ones") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) matrix[r][c] = 1;
    }
  } else if (structure === "diagonal") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) matrix[r][c] = r === c ? fill() : 0;
    }
  } else if (structure === "upper") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) matrix[r][c] = c >= r ? fill() : 0;
    }
  } else if (structure === "lower") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) matrix[r][c] = c <= r ? fill() : 0;
    }
  } else if (structure === "symmetric") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = r; c < cols; c += 1) {
        const value = r === c ? fill() : fill();
        matrix[r][c] = value;
        if (c < rows) matrix[c][r] = value;
      }
    }
  } else if (structure === "skew") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = r; c < cols; c += 1) {
        if (r === c) {
          matrix[r][c] = 0;
        } else {
          const value = fill();
          matrix[r][c] = value;
          if (c < rows) matrix[c][r] = roundTo(-value, decimals);
        }
      }
    }
  } else if (structure === "sparse") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        matrix[r][c] = rng() * 100 < density ? fill() : 0;
      }
    }
  } else if (structure === "banded") {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        matrix[r][c] = Math.abs(r - c) <= bandwidth ? fill() : 0;
      }
    }
  } else if (structure === "toeplitz") {
    const top = Array.from({ length: cols }, () => fill());
    const left = Array.from({ length: rows }, () => fill());
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        matrix[r][c] = c >= r ? top[c - r] : left[r - c];
      }
    }
  } else {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) matrix[r][c] = fill();
    }
  }

  if (settings.diagonalDominance && rows === cols) {
    for (let r = 0; r < rows; r += 1) {
      let offSum = 0;
      for (let c = 0; c < cols; c += 1) {
        if (c !== r) offSum += Math.abs(matrix[r][c]);
      }
      const base = Math.max(1, randomInRange(rng, 1, Math.max(2, rows), 0));
      matrix[r][r] = roundTo((matrix[r][r] < 0 ? -1 : 1) * (offSum + base), decimals);
    }
  }

  return matrix;
}

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                */
/* -------------------------------------------------------------------------- */

export function formatCell(value, precision = 3) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value ?? "0");
  if (Object.is(numeric, -0) || Math.abs(numeric) < 1e-12) return "0";
  const rounded = Number(numeric.toFixed(Math.max(0, Math.min(10, precision))));
  return String(rounded);
}

function bracketString(matrix, precision) {
  if (!matrix.length) return "";
  const cells = matrix.map((row) => row.map((cell) => formatCell(cell, precision)));
  const widths = matrix[0].map((_, col) =>
    Math.max(...cells.map((row) => (row[col] ?? "").length), 1),
  );
  const rows = cells.map(
    (row) => row.map((cell, col) => cell.padStart(widths[col], " ")).join("  "),
  );
  if (rows.length === 1) return `[ ${rows[0]} ]`;
  return rows
    .map((row, index) => {
      const left = index === 0 ? "⎡" : index === rows.length - 1 ? "⎣" : "⎢";
      const right = index === 0 ? "⎤" : index === rows.length - 1 ? "⎦" : "⎥";
      return `${left} ${row} ${right}`;
    })
    .join("\n");
}

export function matrixToString(matrix, format = "brackets", precision = 3) {
  if (!matrix.length) return "";
  const numeric = matrix.map((row) => row.map((cell) => Number(cell) || 0));
  if (format === "csv") {
    return numeric.map((row) => row.join(",")).join("\n");
  }
  if (format === "json") {
    return JSON.stringify(matrix.map((row) => row.map((cell) => Number(cell) || 0)), null, 2);
  }
  if (format === "plain") {
    return `[ ${matrix
      .map((row) => `[ ${row.map((cell) => formatCell(cell, precision)).join(", ")} ]`)
      .join(", ")} ]`;
  }
  if (format === "latex") {
    const rows = matrix
      .map((row) => row.map((cell) => formatCell(cell, precision)).join(" & "))
      .join(" \\\\\n");
    return `\\begin{bmatrix}\n${rows}\n\\end{bmatrix}`;
  }
  if (format === "python") {
    const rows = matrix
      .map((row) => `    [${row.map((cell) => formatCell(cell, precision)).join(", ")}]`)
      .join(",\n");
    return `np.array([\n${rows}\n])`;
  }
  if (format === "matlab") {
    return `[${matrix
      .map((row) => row.map((cell) => formatCell(cell, precision)).join(" "))
      .join("; ")}]`;
  }
  if (format === "markdown") {
    const header = `| ${matrix[0].map((_, index) => `C${index + 1}`).join(" | ")} |`;
    const divider = `| ${matrix[0].map(() => "---").join(" | ")} |`;
    const rows = matrix.map(
      (row) => `| ${row.map((cell) => formatCell(cell, precision)).join(" | ")} |`,
    );
    return [header, divider, ...rows].join("\n");
  }
  return bracketString(matrix, precision);
}

export const FORMAT_META = {
  brackets: { extension: "txt", mime: "text/plain;charset=utf-8" },
  plain: { extension: "txt", mime: "text/plain;charset=utf-8" },
  csv: { extension: "csv", mime: "text/csv;charset=utf-8" },
  latex: { extension: "tex", mime: "text/plain;charset=utf-8" },
  json: { extension: "json", mime: "application/json;charset=utf-8" },
  python: { extension: "py", mime: "text/plain;charset=utf-8" },
  matlab: { extension: "m", mime: "text/plain;charset=utf-8" },
  markdown: { extension: "md", mime: "text/markdown;charset=utf-8" },
};

/* -------------------------------------------------------------------------- */
/*  Analysis                                                                  */
/* -------------------------------------------------------------------------- */

export function parseGrid(grid) {
  return grid.map((row) => row.map((cell) => (cell === "" || cell === "-" ? 0 : Number(cell))));
}

export function transposeMatrix(matrix) {
  if (!matrix.length) return [];
  return matrix[0].map((_, col) => matrix.map((row) => row[col] ?? 0));
}

export function multiplyMatrices(a, b) {
  if (!a.length || !b.length || a[0].length !== b.length) return [];
  return a.map((row) =>
    b[0].map((_, col) => row.reduce((sum, value, index) => sum + value * b[index][col], 0)),
  );
}

export function determinant(matrix) {
  if (!matrix.length || matrix.length !== matrix[0].length) return null;
  const n = matrix.length;
  const a = matrix.map((row) => row.slice());
  let det = 1;
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) return 0;
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      det *= -1;
    }
    const pivotValue = a[col][col];
    det *= pivotValue;
    for (let row = col + 1; row < n; row += 1) {
      const factor = a[row][col] / pivotValue;
      for (let k = col; k < n; k += 1) a[row][k] -= factor * a[col][k];
    }
  }
  return det;
}

export function matrixRank(matrix) {
  if (!matrix.length) return 0;
  const a = matrix.map((row) => row.slice());
  const rows = a.length;
  const cols = a[0].length;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col += 1) {
    let pivot = rank;
    for (let row = rank + 1; row < rows; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-10) continue;
    [a[pivot], a[rank]] = [a[rank], a[pivot]];
    const pivotValue = a[rank][col];
    for (let row = 0; row < rows; row += 1) {
      if (row === rank) continue;
      const factor = a[row][col] / pivotValue;
      for (let k = col; k < cols; k += 1) a[row][k] -= factor * a[rank][k];
    }
    rank += 1;
  }
  return rank;
}

export function inverseMatrix(matrix) {
  const n = matrix.length;
  if (!n || n !== matrix[0].length) return null;
  const a = matrix.map((row, index) => [
    ...row.map((value) => Number(value) || 0),
    ...Array.from({ length: n }, (_, col) => (col === index ? 1 : 0)),
  ]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-10) return null;
    [a[pivot], a[col]] = [a[col], a[pivot]];
    const pivotValue = a[col][col];
    for (let k = 0; k < n * 2; k += 1) a[col][k] /= pivotValue;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let k = 0; k < n * 2; k += 1) a[row][k] -= factor * a[col][k];
    }
  }
  return a.map((row) => row.slice(n));
}

function nearlyEqual(a, b, tolerance = 1e-9) {
  return Math.abs(a - b) <= tolerance;
}

export function analyzeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  const flat = matrix.flat();
  const isSquare = rows > 0 && rows === cols;
  const nonZero = flat.filter((value) => Math.abs(value) > 1e-12).length;
  const zeroCount = flat.length - nonZero;
  const symmetry = isSquare
    ? flat.every((value, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return nearlyEqual(value, matrix[col][row]);
      })
    : false;
  const skew = isSquare
    ? matrix.every((row, r) => row.every((value, c) => nearlyEqual(value, -matrix[c][r])))
    : false;
  const diagonal = isSquare
    ? matrix.every((row, r) => row.every((value, c) => r === c || nearlyEqual(value, 0)))
    : false;
  const upper = matrix.every((row, r) => row.every((value, c) => c >= r || nearlyEqual(value, 0)));
  const lower = matrix.every((row, r) => row.every((value, c) => c <= r || nearlyEqual(value, 0)));
  const identity = isSquare && matrix.every((row, r) => row.every((value, c) => nearlyEqual(value, r === c ? 1 : 0)));
  const diagonalDominant = isSquare
    ? matrix.every((row, r) => {
        const off = row.reduce((sum, value, c) => (c === r ? sum : sum + Math.abs(value)), 0);
        return Math.abs(row[r]) >= off;
      })
    : false;

  let positiveDefinite = false;
  if (isSquare && symmetry) {
    positiveDefinite = true;
    for (let size = 1; size <= rows; size += 1) {
      const minor = matrix.slice(0, size).map((row) => row.slice(0, size));
      const value = determinant(minor);
      if (value === null || value <= 1e-10) {
        positiveDefinite = false;
        break;
      }
    }
  }

  const det = isSquare ? determinant(matrix) : null;
  const tolerance = 1e-9;
  const orthogonal = isSquare
    ? (() => {
        const product = multiplyMatrices(matrix, transposeMatrix(matrix));
        return product.every((row, r) => row.every((value, c) => nearlyEqual(value, r === c ? 1 : 0, 1e-6)));
      })()
    : false;

  return {
    rows,
    cols,
    isSquare,
    det,
    rank: matrixRank(matrix),
    trace: isSquare ? matrix.reduce((sum, row, index) => sum + row[index], 0) : null,
    frobenius: Math.sqrt(flat.reduce((sum, value) => sum + value * value, 0)),
    nonZero,
    zeroCount,
    sparsity: flat.length ? (zeroCount / flat.length) * 100 : 0,
    min: flat.length ? Math.min(...flat) : 0,
    max: flat.length ? Math.max(...flat) : 0,
    symmetric: symmetry,
    skewSymmetric: skew,
    diagonal,
    upperTriangular: upper,
    lowerTriangular: lower,
    identity,
    diagonalDominant,
    positiveDefinite,
    orthogonal,
    invertible: isSquare && det !== null && Math.abs(det) > tolerance,
  };
}

export function matrixToLatex(matrix, precision = 3) {
  return matrixToString(matrix, "latex", precision);
}

export function buildMatrixReport(analysis, formatted, settings, display, seed) {
  const lines = [
    "ToolsTrek Matrix Generator",
    `Generated: ${new Date().toISOString()}`,
    `Size: ${analysis.rows} × ${analysis.cols}`,
    `Structure: ${settings.structure}`,
    `Range: ${settings.min} to ${settings.max}`,
    `Decimals: ${settings.decimals}`,
    `Seed: ${seed}`,
    "",
    "Matrix",
    formatted,
    "",
    "Analysis",
    `Determinant: ${analysis.isSquare ? formatCell(analysis.det, display.precision) : "not defined (not square)"}`,
    `Rank: ${analysis.rank}`,
    `Trace: ${analysis.trace === null ? "not defined (not square)" : formatCell(analysis.trace, display.precision)}`,
    `Frobenius norm: ${formatCell(analysis.frobenius, display.precision)}`,
    `Non-zero entries: ${analysis.nonZero} of ${analysis.rows * analysis.cols}`,
    `Sparsity: ${analysis.sparsity.toFixed(1)}%`,
    `Symmetric: ${analysis.symmetric ? "yes" : "no"}`,
    `Diagonal dominant: ${analysis.diagonalDominant ? "yes" : "no"}`,
    `Invertible: ${analysis.invertible ? "yes" : "no"}`,
  ];
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const MATRIX_GENERATOR_FAQS = [
  {
    question: "What is a matrix generator?",
    answer:
      "A matrix generator builds a rectangular grid of numbers from the rules you choose. You can create random matrices, identity matrices, triangular matrices, symmetric and skew-symmetric matrices, sparse matrices, banded matrices and Toeplitz matrices, then copy the result into code, a document or a spreadsheet.",
  },
  {
    question: "How does the seed work?",
    answer:
      "The seed makes random generation reproducible. The same seed, size and settings always produce exactly the same matrix. Keep the seed when you want repeatable examples or tests, or press Shuffle to draw a new one.",
  },
  {
    question: "What is a symmetric matrix?",
    answer:
      "A symmetric matrix equals its own transpose, so entry (row, column) matches entry (column, row). A skew-symmetric matrix has zeros on the diagonal and opposite values across it. Both structures are useful for covariance matrices, graph adjacency and rotations.",
  },
  {
    question: "Can I edit the generated numbers?",
    answer:
      "Yes. Turn on Editable cells and click any value to type a new one. The analysis, transpose and inverse update immediately, so you can use the tool as a small matrix workspace instead of only a generator.",
  },
  {
    question: "What does diagonal dominance mean?",
    answer:
      "A square matrix is diagonally dominant when the absolute value of each diagonal entry is at least the sum of the absolute values of the other entries in its row. Diagonally dominant matrices are guaranteed to be invertible and are ideal for iterative numerical methods.",
  },
  {
    question: "Is the matrix generator free and private?",
    answer:
      "Yes. Every calculation runs in your browser with JavaScript. No matrix is uploaded, stored or logged, and the tool works without an account.",
  },
];
