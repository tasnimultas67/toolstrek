/* -------------------------------------------------------------------------- */
/*  Matrix Calculator — pure linear algebra helpers with friendly errors      */
/* -------------------------------------------------------------------------- */

export class MatrixError extends Error {
  constructor(message) {
    super(message);
    this.name = "MatrixError";
  }
}

export const MAX_DIMENSION = 8;

export const MATRIX_FAQS = [
  {
    question: "Which matrix operations are supported?",
    answer:
      "Addition, subtraction, multiplication, Hadamard (element-wise) product, Kronecker product, scalar multiplication, integer powers, transpose, determinant, inverse, rank, trace, adjugate, cofactor matrix, reduced row echelon form (RREF) and solving a square linear system Ax = b.",
  },
  {
    question: "Why does matrix multiplication need matching dimensions?",
    answer:
      "To compute C = A × B, the number of columns in A must equal the number of rows in B. Each entry C[i][j] is the dot product of row i of A and column j of B. If A is m×n and B is n×p, the result is m×p. This tool checks the shapes before doing any work and tells you exactly which dimensions are incompatible.",
  },
  {
    question: "What makes a matrix singular?",
    answer:
      "A square matrix is singular when its determinant is zero and it has no inverse. That means at least one row is a linear combination of the others, so the transformation collapses part of the space. The inverse and some linear systems will fail with a clear explanation instead of returning misleading numbers.",
  },
  {
    question: "How is the determinant calculated?",
    answer:
      "The tool uses LU decomposition with partial pivoting. It swaps rows to place the largest available pivot on the diagonal, multiplies the pivots, and flips the sign for every row swap. This is far faster and more stable than cofactor expansion for matrices up to 8×8.",
  },
  {
    question: "Why is my inverse slightly off?",
    answer:
      "Matrix arithmetic uses IEEE-754 floating point. Numbers that should be zero can appear as values such as 1e-16. The tool applies a configurable tolerance when checking pivots and cleans tiny values for display. Increase the tolerance in Advanced options if a near-singular matrix is being treated as singular.",
  },
  {
    question: "When does Ax = b have no unique solution?",
    answer:
      "If the coefficient matrix is singular, the system either has no solution or infinitely many. The solver reduces the augmented matrix and reports which case applies. For a unique solution, the rank must equal the number of variables and the final column must not become a pivot column.",
  },
  {
    question: "Can I export the result?",
    answer:
      "Yes. Matrix results can be copied as CSV, TSV or LaTeX, and downloaded as CSV or JSON. Scalar results can be copied as plain text. The full working steps, when enabled, are included in the JSON export.",
  },
  {
    question: "Is anything sent to a server?",
    answer:
      "No. Every matrix is stored in React state and every calculation runs in your browser. Refreshing the page clears the matrices unless you copy or export them first.",
  },
];

export const OPERATIONS = [
  {
    id: "add",
    label: "A + B",
    group: "Basic",
    binary: true,
    description: "Element-wise addition. Both matrices must have identical dimensions.",
  },
  {
    id: "subtract",
    label: "A − B",
    group: "Basic",
    binary: true,
    description: "Element-wise subtraction. Both matrices must have identical dimensions.",
  },
  {
    id: "multiply",
    label: "A × B",
    group: "Basic",
    binary: true,
    description: "Standard matrix product. A's columns must equal B's rows.",
  },
  {
    id: "hadamard",
    label: "A ⊙ B",
    group: "Basic",
    binary: true,
    description: "Hadamard product: multiply matching entries. Dimensions must match.",
  },
  {
    id: "kron",
    label: "A ⊗ B",
    group: "Basic",
    binary: true,
    description: "Kronecker product: every entry of A multiplied by the whole of B.",
  },
  {
    id: "scalar",
    label: "k × A",
    group: "Basic",
    unary: true,
    scalar: true,
    description: "Multiply every entry of A by a single number.",
  },
  {
    id: "transpose",
    label: "Aᵀ",
    group: "Unary",
    unary: true,
    description: "Swap rows and columns. An m×n matrix becomes n×m.",
  },
  {
    id: "determinant",
    label: "det(A)",
    group: "Unary",
    unary: true,
    result: "scalar",
    description: "Requires a square matrix. A zero determinant means the matrix is singular.",
  },
  {
    id: "inverse",
    label: "A⁻¹",
    group: "Unary",
    unary: true,
    result: "matrix",
    description: "Requires a square, non-singular matrix.",
  },
  {
    id: "rank",
    label: "rank(A)",
    group: "Unary",
    unary: true,
    result: "scalar",
    description: "Number of linearly independent rows or columns.",
  },
  {
    id: "trace",
    label: "tr(A)",
    group: "Unary",
    unary: true,
    result: "scalar",
    description: "Sum of the main diagonal. Requires a square matrix.",
  },
  {
    id: "adjugate",
    label: "adj(A)",
    group: "Unary",
    unary: true,
    result: "matrix",
    description: "Transpose of the cofactor matrix. Requires a square matrix.",
  },
  {
    id: "cofactor",
    label: "cofactor(A)",
    group: "Unary",
    unary: true,
    result: "matrix",
    description: "Signed minors of a square matrix.",
  },
  {
    id: "rref",
    label: "rref(A)",
    group: "Unary",
    unary: true,
    result: "matrix",
    description: "Reduced row echelon form, with optional row-operation steps.",
  },
  {
    id: "power",
    label: "A^k",
    group: "Unary",
    unary: true,
    power: true,
    result: "matrix",
    description: "Integer power of a square matrix. Negative powers use the inverse.",
  },
  {
    id: "solve",
    label: "Solve Ax = b",
    group: "Linear system",
    unary: true,
    vector: true,
    result: "vector",
    description: "Solve a square system. Enter one value for each row of A.",
  },
];

export const OPERATION_GROUPS = ["Basic", "Unary", "Linear system"];

export function operationMeta(id) {
  return OPERATIONS.find((operation) => operation.id === id) || OPERATIONS[0];
}

export const DEFAULT_A = [
  ["2", "1", "0"],
  ["1", "3", "1"],
  ["0", "1", "2"],
];

export const DEFAULT_B = [
  ["1", "0", "2"],
  ["0", "2", "1"],
  ["2", "1", "0"],
];

export const DEFAULT_VECTOR = ["1", "2", "3"];

export function createGrid(rows, cols, fill = "0") {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

export function resizeGrid(grid, rows, cols) {
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => grid[rowIndex]?.[colIndex] ?? "0"),
  );
}

export function identityMatrix(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row === col ? 1 : 0)),
  );
}

export function parseGrid(grid, label = "Matrix") {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const matrix = [];
  const errors = [];
  for (let row = 0; row < rows; row += 1) {
    const values = [];
    for (let col = 0; col < cols; col += 1) {
      const raw = String(grid[row]?.[col] ?? "").trim();
      if (!raw) {
        values.push(0);
        continue;
      }
      const normalized = raw.replace(/,/g, "");
      const value = Number(normalized);
      if (!Number.isFinite(value)) {
        errors.push(`${label}: row ${row + 1}, column ${col + 1} (“${raw}”) is not a valid number.`);
        values.push(0);
      } else {
        values.push(value);
      }
    }
    matrix.push(values);
  }
  return { matrix, errors, rows, cols };
}

export function parseVector(values, length, label = "Vector b") {
  const vector = [];
  const errors = [];
  for (let index = 0; index < length; index += 1) {
    const raw = String(values[index] ?? "").trim();
    if (!raw) {
      vector.push(0);
      continue;
    }
    const value = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(value)) {
      errors.push(`${label}: entry ${index + 1} (“${raw}”) is not a valid number.`);
      vector.push(0);
    } else {
      vector.push(value);
    }
  }
  return { vector, errors };
}

export function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

export function assertMatrix(matrix, label = "Matrix") {
  if (!Array.isArray(matrix) || !matrix.length || !Array.isArray(matrix[0])) {
    throw new MatrixError(`${label} is empty or malformed.`);
  }
  const cols = matrix[0].length;
  if (!cols) throw new MatrixError(`${label} has no columns.`);
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new MatrixError(`${label} has inconsistent row lengths.`);
    }
    for (const value of row) {
      if (!Number.isFinite(value)) throw new MatrixError(`${label} contains a value that is not finite.`);
    }
  }
  return { rows: matrix.length, cols };
}

export function dimensions(matrix) {
  return `${matrix.length} × ${matrix[0]?.length || 0}`;
}

export function addMatrices(a, b) {
  const { rows, cols } = assertMatrix(a, "Matrix A");
  assertMatrix(b, "Matrix B");
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new MatrixError(
      `Addition needs equal dimensions, but A is ${dimensions(a)} and B is ${dimensions(b)}. Use the dimension controls to match them.`,
    );
  }
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => a[row][col] + b[row][col]),
  );
}

export function subtractMatrices(a, b) {
  const { rows, cols } = assertMatrix(a, "Matrix A");
  assertMatrix(b, "Matrix B");
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new MatrixError(
      `Subtraction needs equal dimensions, but A is ${dimensions(a)} and B is ${dimensions(b)}.`,
    );
  }
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => a[row][col] - b[row][col]),
  );
}

export function multiplyMatrices(a, b) {
  const { rows, cols } = assertMatrix(a, "Matrix A");
  const bDims = assertMatrix(b, "Matrix B");
  if (cols !== bDims.rows) {
    throw new MatrixError(
      `Multiplication needs A's column count to equal B's row count. A is ${dimensions(a)} and B is ${dimensions(b)}.`,
    );
  }
  const result = Array.from({ length: rows }, () => Array.from({ length: bDims.cols }, () => 0));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < bDims.cols; col += 1) {
      let sum = 0;
      for (let index = 0; index < cols; index += 1) {
        sum += a[row][index] * b[index][col];
      }
      result[row][col] = sum;
    }
  }
  return result;
}

export function hadamardProduct(a, b) {
  const { rows, cols } = assertMatrix(a, "Matrix A");
  assertMatrix(b, "Matrix B");
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new MatrixError(
      `The Hadamard product needs equal dimensions, but A is ${dimensions(a)} and B is ${dimensions(b)}.`,
    );
  }
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => a[row][col] * b[row][col]),
  );
}

export function kroneckerProduct(a, b) {
  const { rows, cols } = assertMatrix(a, "Matrix A");
  const bDims = assertMatrix(b, "Matrix B");
  const result = Array.from({ length: rows * bDims.rows }, () =>
    Array.from({ length: cols * bDims.cols }, () => 0),
  );
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      for (let bRow = 0; bRow < bDims.rows; bRow += 1) {
        for (let bCol = 0; bCol < bDims.cols; bCol += 1) {
          result[row * bDims.rows + bRow][col * bDims.cols + bCol] = a[row][col] * b[bRow][bCol];
        }
      }
    }
  }
  return result;
}

export function scalarMultiply(matrix, scalar) {
  assertMatrix(matrix, "Matrix A");
  if (!Number.isFinite(scalar)) throw new MatrixError("The scalar must be a finite number.");
  return matrix.map((row) => row.map((value) => value * scalar));
}

export function transposeMatrix(matrix) {
  const { rows, cols } = assertMatrix(matrix, "Matrix A");
  return Array.from({ length: cols }, (_, col) =>
    Array.from({ length: rows }, (_, row) => matrix[row][col]),
  );
}

export function assertSquare(matrix, label = "Matrix A") {
  const { rows, cols } = assertMatrix(matrix, label);
  if (rows !== cols) {
    throw new MatrixError(`${label} must be square for this operation, but it is ${rows} × ${cols}.`);
  }
  return rows;
}

export function determinant(matrix, tolerance = 1e-10) {
  const n = assertSquare(matrix);
  const working = cloneMatrix(matrix);
  let result = 1;
  let swaps = 0;

  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(working[row][col]) > Math.abs(working[pivotRow][col])) pivotRow = row;
    }
    if (Math.abs(working[pivotRow][col]) <= tolerance) return 0;
    if (pivotRow !== col) {
      [working[pivotRow], working[col]] = [working[col], working[pivotRow]];
      swaps += 1;
    }
    const pivot = working[col][col];
    if (Math.abs(pivot) <= tolerance) return 0;
    result *= pivot;
    for (let row = col + 1; row < n; row += 1) {
      const factor = working[row][col] / pivot;
      for (let index = col; index < n; index += 1) {
        working[row][index] -= factor * working[col][index];
      }
    }
  }

  return swaps % 2 === 0 ? result : -result;
}

export function inverse(matrix, tolerance = 1e-10) {
  const n = assertSquare(matrix);
  const augmented = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: n }, (_, col) => (index === col ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) pivotRow = row;
    }
    if (Math.abs(augmented[pivotRow][col]) <= tolerance) {
      throw new MatrixError(
        "This matrix is singular (its determinant is effectively zero), so it has no inverse. Check det(A) or adjust a row.",
      );
    }
    if (pivotRow !== col) {
      [augmented[pivotRow], augmented[col]] = [augmented[col], augmented[pivotRow]];
    }
    const pivot = augmented[col][col];
    for (let index = 0; index < n * 2; index += 1) augmented[col][index] /= pivot;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = augmented[row][col];
      if (Math.abs(factor) <= tolerance) continue;
      for (let index = 0; index < n * 2; index += 1) {
        augmented[row][index] -= factor * augmented[col][index];
      }
    }
  }

  return augmented.map((row) => row.slice(n));
}

export function matrixRank(matrix, tolerance = 1e-10) {
  const { matrix: reduced, pivots } = rref(matrix, tolerance);
  // The reduced matrix is intentionally unused beyond confirming stability.
  void reduced;
  return pivots.length;
}

export function rref(matrix, tolerance = 1e-10, collectSteps = false) {
  assertMatrix(matrix, "Matrix A");
  const working = cloneMatrix(matrix);
  const rows = working.length;
  const cols = working[0].length;
  const pivots = [];
  const steps = [];
  let pivotRow = 0;

  for (let col = 0; col < cols && pivotRow < rows; col += 1) {
    let bestRow = pivotRow;
    for (let row = pivotRow + 1; row < rows; row += 1) {
      if (Math.abs(working[row][col]) > Math.abs(working[bestRow][col])) bestRow = row;
    }
    if (Math.abs(working[bestRow][col]) <= tolerance) {
      for (let row = 0; row < rows; row += 1) working[row][col] = 0;
      continue;
    }

    if (bestRow !== pivotRow) {
      [working[bestRow], working[pivotRow]] = [working[pivotRow], working[bestRow]];
      if (collectSteps) steps.push(`Swap R${pivotRow + 1} and R${bestRow + 1}.`);
    }

    const pivot = working[pivotRow][col];
    if (Math.abs(pivot - 1) > tolerance) {
      for (let index = 0; index < cols; index += 1) working[pivotRow][index] /= pivot;
      if (collectSteps) steps.push(`Divide R${pivotRow + 1} by ${shortNumber(pivot)}.`);
    }

    for (let row = 0; row < rows; row += 1) {
      if (row === pivotRow) continue;
      const factor = working[row][col];
      if (Math.abs(factor) <= tolerance) continue;
      for (let index = 0; index < cols; index += 1) {
        working[row][index] -= factor * working[pivotRow][index];
      }
      if (collectSteps) steps.push(`R${row + 1} ← R${row + 1} − (${shortNumber(factor)})·R${pivotRow + 1}.`);
    }

    pivots.push(col);
    pivotRow += 1;
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (Math.abs(working[row][col]) <= tolerance) working[row][col] = 0;
    }
  }

  return { matrix: working, pivots, steps };
}

export function cofactorMatrix(matrix, tolerance = 1e-10) {
  const n = assertSquare(matrix);
  if (n === 1) return [[1]];
  return matrix.map((row, rowIndex) =>
    row.map((_, colIndex) => {
      const minor = matrix
        .filter((_, index) => index !== rowIndex)
        .map((sourceRow) => sourceRow.filter((_, index) => index !== colIndex));
      const sign = (rowIndex + colIndex) % 2 === 0 ? 1 : -1;
      return sign * determinant(minor, tolerance);
    }),
  );
}

export function adjugate(matrix, tolerance = 1e-10) {
  const n = assertSquare(matrix);
  if (n === 1) return [[1]];
  return transposeMatrix(cofactorMatrix(matrix, tolerance));
}

export function matrixPower(matrix, exponent, tolerance = 1e-10) {
  const n = assertSquare(matrix);
  if (!Number.isInteger(exponent)) throw new MatrixError("The exponent must be a whole number.");
  if (exponent < -50 || exponent > 50) throw new MatrixError("Keep the exponent between −50 and 50.");
  let base = cloneMatrix(matrix);
  let power = exponent;
  if (power < 0) {
    base = inverse(matrix, tolerance);
    power = -power;
  }
  let result = identityMatrix(n);
  while (power > 0) {
    if (power % 2 === 1) result = multiplyMatrices(result, base);
    base = multiplyMatrices(base, base);
    power = Math.floor(power / 2);
  }
  return result;
}

export function solveLinearSystem(matrix, vector, tolerance = 1e-10) {
  const n = assertSquare(matrix);
  if (vector.length !== n) {
    throw new MatrixError(
      `The right-hand side needs ${n} value${n === 1 ? "" : "s"} to match the ${n} × ${n} matrix.`,
    );
  }
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  const { matrix: reduced, pivots, steps } = rref(augmented, tolerance, true);

  if (pivots.includes(n)) {
    throw new MatrixError(
      "This system is inconsistent: the equations contradict each other, so there is no solution.",
    );
  }

  if (pivots.length < n) {
    throw new MatrixError(
      `This system does not have a unique solution. The coefficient matrix has rank ${pivots.length}, which is less than the ${n} variables — there are infinitely many solutions or none.`,
    );
  }

  const solution = Array.from({ length: n }, (_, index) => reduced[index][n]);
  return { solution, steps, pivots };
}

export function matrixProperties(matrix, tolerance = 1e-10) {
  const { rows, cols } = assertMatrix(matrix, "Result");
  const square = rows === cols;
  let det = null;
  let rankValue = null;
  let trace = null;
  try {
    rankValue = matrixRank(matrix, tolerance);
  } catch {
    rankValue = null;
  }
  if (square) {
    try {
      det = determinant(matrix, tolerance);
      trace = matrix.reduce((sum, row, index) => sum + row[index], 0);
    } catch {
      det = null;
    }
  }
  const identity =
    square &&
    matrix.every((row, rowIndex) =>
      row.every((value, colIndex) =>
        rowIndex === colIndex ? Math.abs(value - 1) <= tolerance : Math.abs(value) <= tolerance,
      ),
    );
  const zero = matrix.every((row) => row.every((value) => Math.abs(value) <= tolerance));
  const diagonal = square && matrix.every((row, rowIndex) => row.every((value, colIndex) => rowIndex === colIndex || Math.abs(value) <= tolerance));
  const symmetric =
    square &&
    matrix.every((row, rowIndex) =>
      row.every((value, colIndex) => Math.abs(value - matrix[colIndex][rowIndex]) <= tolerance),
    );
  return {
    rows,
    cols,
    square,
    determinant: det,
    trace,
    rank: rankValue,
    identity,
    zero,
    diagonal,
    symmetric,
    singular: square ? det !== null && Math.abs(det) <= tolerance : false,
  };
}

export function shortNumber(value) {
  if (Object.is(value, -0) || Math.abs(value) < 1e-12) return "0";
  const rounded = Number(value.toFixed(4));
  return String(rounded);
}

export function formatNumber(value, precision = 4, notation = "auto") {
  if (!Number.isFinite(value)) return String(value);
  let normalized = value;
  if (Object.is(normalized, -0)) normalized = 0;
  const abs = Math.abs(normalized);
  if (notation === "scientific" || (notation === "auto" && abs !== 0 && (abs < 1e-6 || abs >= 1e9))) {
    return normalized.toExponential(precision);
  }
  let text = normalized.toFixed(precision);
  if (text.includes(".")) text = text.replace(/0+$/, "").replace(/\.$/, "");
  if (text === "-0") text = "0";
  return text;
}

export function matrixToCsv(matrix, precision = 4, notation = "auto") {
  return matrix
    .map((row) => row.map((value) => formatNumber(value, precision, notation)).join(","))
    .join("\r\n");
}

export function matrixToTsv(matrix, precision = 4, notation = "auto") {
  return matrix
    .map((row) => row.map((value) => formatNumber(value, precision, notation)).join("\t"))
    .join("\r\n");
}

export function matrixToLatex(matrix, precision = 4, notation = "auto") {
  const body = matrix
    .map((row) => row.map((value) => formatNumber(value, precision, notation)).join(" & "))
    .join(" \\\\ ");
  return `\\begin{bmatrix} ${body} \\end{bmatrix}`;
}

export function matrixToJson(matrix, precision = 4, notation = "auto") {
  return JSON.stringify(
    matrix.map((row) => row.map((value) => formatNumber(value, precision, notation))),
    null,
    2,
  );
}

export function parseMatrixText(text) {
  const lines = String(text || "")
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return { ok: false, error: "Paste at least one row of numbers." };
  const rows = [];
  for (const line of lines) {
    const cells = line
      .replace(/^\[|\]$/g, "")
      .split(/[\t,;]+|\s{2,}/)
      .map((cell) => cell.trim())
      .filter((cell, index, array) => !(cell === "" && index === array.length - 1));
    if (!cells.length) return { ok: false, error: "A row in the pasted matrix is empty." };
    const values = [];
    for (const cell of cells) {
      const value = Number(cell.replace(/^["']|["']$/g, ""));
      if (!Number.isFinite(value)) {
        return { ok: false, error: `“${cell}” is not a valid number.` };
      }
      values.push(value);
    }
    if (rows.length && values.length !== rows[0].length) {
      return { ok: false, error: "Every pasted row must contain the same number of values." };
    }
    rows.push(values);
  }
  if (rows.length > MAX_DIMENSION || rows[0].length > MAX_DIMENSION) {
    return { ok: false, error: `Matrices are limited to ${MAX_DIMENSION} × ${MAX_DIMENSION}.` };
  }
  return { ok: true, rows, cols: rows[0].length, matrix: rows };
}

export function gridFromMatrix(matrix) {
  return matrix.map((row) => row.map((value) => formatNumber(value, 8, "auto")));
}

export function randomGrid(rows, cols, integerOnly = true) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      if (integerOnly) return String(Math.floor(Math.random() * 19) - 9);
      return String(Number((Math.random() * 18 - 9).toFixed(2)));
    }),
  );
}

export function matrixToGridState(matrix) {
  return matrix.map((row) => row.map((value) => String(value)));
}
