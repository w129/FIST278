/**
 * Álgebra lineal numérica ligera (FIST278).
 * Operaciones usadas por scoring IP, grafos de claims y modelos de portfolio.
 */

export type Matrix = number[][];
export type Vector = number[];

export function zeros(n: number, m: number): Matrix {
  return Array.from({ length: n }, () => Array(m).fill(0));
}

export function identity(n: number): Matrix {
  const I = zeros(n, n);
  for (let i = 0; i < n; i++) I[i][i] = 1;
  return I;
}

export function clone(A: Matrix): Matrix {
  return A.map((row) => [...row]);
}

export function matVec(A: Matrix, x: Vector): Vector {
  return A.map((row) => row.reduce((s, aij, j) => s + aij * x[j], 0));
}

export function matMul(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  const p = B[0].length;
  const m = B.length;
  const C = zeros(n, p);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < m; k++) {
      const aik = A[i][k];
      for (let j = 0; j < p; j++) C[i][j] += aik * B[k][j];
    }
  }
  return C;
}

export function transpose(A: Matrix): Matrix {
  const n = A.length;
  const m = A[0].length;
  const T = zeros(m, n);
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) T[j][i] = A[i][j];
  return T;
}

export function dot(a: Vector, b: Vector): number {
  return a.reduce((s, ai, i) => s + ai * b[i], 0);
}

export function norm2(x: Vector): number {
  return Math.sqrt(dot(x, x));
}

export function scale(x: Vector, s: number): Vector {
  return x.map((v) => v * s);
}

export function add(a: Vector, b: Vector): Vector {
  return a.map((v, i) => v + b[i]);
}

export function sub(a: Vector, b: Vector): Vector {
  return a.map((v, i) => v - b[i]);
}

/** Eliminación de Gauss con pivoteo parcial para Ax = b */
export function solveLinear(Ain: Matrix, bIn: Vector): Vector {
  const n = Ain.length;
  const A = clone(Ain);
  const b = [...bIn];
  for (let k = 0; k < n; k++) {
    let piv = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(A[i][k]) > Math.abs(A[piv][k])) piv = i;
    }
    if (Math.abs(A[piv][k]) < 1e-12) throw new Error('Matriz singular o mal condicionada');
    if (piv !== k) {
      [A[k], A[piv]] = [A[piv], A[k]];
      [b[k], b[piv]] = [b[piv], b[k]];
    }
    for (let i = k + 1; i < n; i++) {
      const f = A[i][k] / A[k][k];
      for (let j = k; j < n; j++) A[i][j] -= f * A[k][j];
      b[i] -= f * b[k];
    }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

/**
 * Potencia iterada: autovalor dominante y autovector (Rayleigh).
 * Útil para AHP (Analytic Hierarchy Process) y centralidad de grafos.
 */
export function powerIteration(
  A: Matrix,
  maxIter = 100,
  tol = 1e-10,
): { eigenvalue: number; eigenvector: Vector; residual: number } {
  const n = A.length;
  let v = Array.from({ length: n }, () => 1 / Math.sqrt(n));
  let lambda = 0;
  for (let it = 0; it < maxIter; it++) {
    const Av = matVec(A, v);
    const nrm = norm2(Av);
    if (nrm < 1e-15) break;
    const vNext = scale(Av, 1 / nrm);
    lambda = dot(vNext, matVec(A, vNext));
    const err = norm2(sub(vNext, v));
    v = vNext;
    if (err < tol) break;
  }
  const residual = norm2(sub(matVec(A, v), scale(v, lambda)));
  return { eigenvalue: lambda, eigenvector: v, residual };
}

/** Número de condición aproximado κ₂ ≈ |λ_max / λ_min| vía potencia e inversa */
export function approxConditionNumber(A: Matrix): number {
  const { eigenvalue: lmax } = powerIteration(A);
  // Inverse iteration: shift 0, solve A y = v
  const n = A.length;
  let v = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0.01 * (i + 1)));
  v = scale(v, 1 / norm2(v));
  let lmin = lmax;
  try {
    for (let it = 0; it < 40; it++) {
      const y = solveLinear(A, v);
      v = scale(y, 1 / norm2(y));
    }
    const Av = matVec(A, v);
    lmin = Math.abs(dot(v, Av));
  } catch {
    return Infinity;
  }
  if (lmin < 1e-15) return Infinity;
  return Math.abs(lmax / lmin);
}

/** Norma de Frobenius */
export function frobenius(A: Matrix): number {
  let s = 0;
  for (const row of A) for (const a of row) s += a * a;
  return Math.sqrt(s);
}

/** Exponencial de matriz truncada (Taylor) e^{tA} ≈ Σ (tA)^k / k! */
export function expmTaylor(A: Matrix, t = 1, terms = 20): Matrix {
  const n = A.length;
  let term = identity(n);
  let sum = identity(n);
  const tA = A.map((row) => row.map((v) => v * t));
  for (let k = 1; k <= terms; k++) {
    term = matMul(term, tA).map((row) => row.map((v) => v / k));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) sum[i][j] += term[i][j];
  }
  return sum;
}
