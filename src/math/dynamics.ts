/**
 * Dinámica de madurez: sistema discreto x_{k+1} = f(x_k) y Markov de etapas.
 * TRL, IPRL, PQRL como coordenadas en [1,9]³ con acoplamiento.
 */

import { expmTaylor, matVec, zeros, type Matrix, type Vector } from './linalg';
import { softmax } from './stats';

function clampLocal(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

/**
 * Estado de madurez r = (trl, iprl, pqrl) ∈ [1,9]³
 * Dinámica: r' = r + η * (W r_norm + u) con saturación.
 */
export function readinessStep(
  state: { trl: number; iprl: number; pqrl: number },
  effort: { tech: number; ip: number; pqc: number },
  dt = 1,
): { trl: number; iprl: number; pqrl: number } {
  const W: Matrix = [
    [0.5, 0.1, 0.15],
    [0.2, 0.55, 0.2],
    [0.15, 0.15, 0.6],
  ];
  const r: Vector = [state.trl / 9, state.iprl / 9, state.pqrl / 9];
  const u: Vector = [effort.tech, effort.ip, effort.pqc];
  const Wr = matVec(W, r);
  const eta = 0.35 * dt;
  const next = r.map((ri, i) => {
    const drive = Wr[i] + 0.45 * u[i] - 0.08 * ri;
    return clampLocal(ri + eta * drive, 0, 1);
  });
  return {
    trl: clampLocal(1 + next[0] * 8, 1, 9),
    iprl: clampLocal(1 + next[1] * 8, 1, 9),
    pqrl: clampLocal(1 + next[2] * 8, 1, 9),
  };
}

export function simulateReadinessPath(
  initial: { trl: number; iprl: number; pqrl: number },
  effort: { tech: number; ip: number; pqc: number },
  steps: number,
): { trl: number; iprl: number; pqrl: number }[] {
  const path = [{ ...initial }];
  let s = { ...initial };
  for (let k = 0; k < steps; k++) {
    s = readinessStep(s, effort);
    path.push({ ...s });
  }
  return path;
}

/**
 * Cadena de Markov en 10 etapas del pipeline.
 * P[i][i] = 1-c_i, P[i][i+1] = c_i
 */
export function stageTransitionMatrix(completionRates: number[]): Matrix {
  const n = 10;
  const P = zeros(n, n);
  for (let i = 0; i < n; i++) {
    const c = clampLocal(completionRates[i] ?? 0.3, 0.05, 0.95);
    if (i === n - 1) {
      P[i][i] = 1;
    } else {
      P[i][i] = 1 - c;
      P[i][i + 1] = c;
    }
  }
  return P;
}

/** π_{t} = π_0 P^t  (vector fila) */
export function stageDistributionForward(
  completionRates: number[],
  t: number,
  startStage = 0,
): number[] {
  const P = stageTransitionMatrix(completionRates);
  let pi = Array(10).fill(0);
  pi[clampLocal(Math.floor(startStage), 0, 9)] = 1;
  for (let s = 0; s < t; s++) {
    const next = Array(10).fill(0);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) next[j] += pi[i] * P[i][j];
    }
    pi = next;
  }
  return pi;
}

export function probReachedStage(completionRates: number[], stageK: number, t: number): number {
  const dist = stageDistributionForward(completionRates, t, 0);
  return dist.slice(stageK).reduce((a, b) => a + b, 0);
}

/**
 * Flujo continuo: dr/dt = A r + B u
 * r(t) ≈ expm(tA) r0 + t * expm(tA/2) B u
 */
export function continuousReadiness(r0: Vector, u: Vector, t: number): Vector {
  const A: Matrix = [
    [-0.15, 0.05, 0.04],
    [0.06, -0.12, 0.05],
    [0.04, 0.05, -0.1],
  ];
  const B: Matrix = [
    [0.4, 0.05, 0.05],
    [0.08, 0.4, 0.08],
    [0.06, 0.06, 0.45],
  ];
  const expA = expmTaylor(A, t, 16);
  const expHalf = expmTaylor(A, t / 2, 16);
  const homogeneous = matVec(expA, r0);
  const Bu = matVec(B, u);
  const particular = matVec(expHalf, Bu).map((v) => v * t);
  return homogeneous.map((v, i) => clampLocal(v + particular[i], 0, 1));
}

export function ipPqcCoupling(stageScores: number[]): number {
  const ip = [stageScores[2] ?? 0, stageScores[3] ?? 0, stageScores[7] ?? 0];
  const pq = [stageScores[6] ?? 0, stageScores[6] ?? 0, (stageScores[0] ?? 0) * 0.5];
  const dot = ip[0] * pq[0] + ip[1] * pq[1] + ip[2] * pq[2];
  const ni = Math.hypot(ip[0], ip[1], ip[2]);
  const nq = Math.hypot(pq[0], pq[1], pq[2]);
  if (ni < 1e-9 || nq < 1e-9) return 0;
  return clampLocal(dot / (ni * nq), -1, 1);
}

/** Grid search en simplex tech+ip+pqc = 1 */
export function optimalEffortAllocation(params: {
  trl: number;
  iprl: number;
  pqrl: number;
  sensitivity: { tech: number; ip: number; pqc: number };
}): { tech: number; ip: number; pqc: number; expectedGain: number } {
  let best = { tech: 0.33, ip: 0.33, pqc: 0.34, expectedGain: -Infinity };
  const gaps = {
    tech: (9 - params.trl) / 9,
    ip: (9 - params.iprl) / 9,
    pqc: (9 - params.pqrl) / 9,
  };
  for (let i = 0; i <= 20; i++) {
    for (let j = 0; j <= 20 - i; j++) {
      const tech = i / 20;
      const ip = j / 20;
      const pqc = 1 - tech - ip;
      const gain =
        params.sensitivity.tech * tech * gaps.tech +
        params.sensitivity.ip * ip * gaps.ip +
        params.sensitivity.pqc * pqc * gaps.pqc;
      const parts = [tech, ip, pqc].filter((x) => x > 1e-12);
      const bal = -parts.reduce((s, x) => s + x * Math.log(x), 0);
      const score = gain + 0.05 * bal;
      if (score > best.expectedGain) best = { tech, ip, pqc, expectedGain: score };
    }
  }
  return best;
}

export function portfolioSoftmaxRanks(scores: number[], temperature = 0.35): number[] {
  return softmax(
    scores.map((s) => s / 100),
    temperature,
  );
}
