/**
 * Scoring multicriterio de IP revolucionaria.
 * AHP (Saaty), entropía de landscape, grafo de claims, índice de novedad.
 */

import type { ClaimNode } from '../types';
import { approxConditionNumber, powerIteration, type Matrix } from './linalg';
import {
  clamp,
  geometricMean,
  normalizeProbs,
  normalizedEntropy,
  shannonEntropy,
  sigmoid,
  softmax,
} from './stats';

export type { ClaimNode };

/** Escala Saaty 1–9 para comparación por pares */
export function buildPairwiseFromWeights(weights: number[]): Matrix {
  const n = weights.length;
  const A: Matrix = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) A[i][j] = 1;
      else A[i][j] = weights[i] / Math.max(1e-12, weights[j]);
    }
  }
  return A;
}

/**
 * AHP: vector de prioridades (autovector principal normalizado) y ratio de consistencia CR.
 * RI (Random Index) estándar Saaty para n=1..10.
 */
const RI = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51];

export function ahpPriorities(pairwise: Matrix): {
  priorities: number[];
  lambdaMax: number;
  CI: number;
  CR: number;
  consistent: boolean;
} {
  const n = pairwise.length;
  const { eigenvalue, eigenvector } = powerIteration(pairwise);
  const raw = eigenvector.map(Math.abs);
  const s = raw.reduce((a, b) => a + b, 0);
  const priorities = raw.map((v) => v / s);
  const lambdaMax = eigenvalue;
  const CI = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
  const ri = RI[Math.min(n, RI.length - 1)] || 1.51;
  const CR = ri > 0 ? CI / ri : 0;
  return { priorities, lambdaMax, CI, CR, consistent: CR < 0.1 };
}

/** Criterios del índice de IP revolucionaria (RII) */
export const RII_CRITERIA = [
  { id: 'novelty', name: 'Novedad / white-space', defaultWeight: 0.22 },
  { id: 'defensibility', name: 'Defendibilidad de claims', defaultWeight: 0.18 },
  { id: 'feasibility', name: 'Viabilidad técnica', defaultWeight: 0.14 },
  { id: 'market', name: 'Impacto de mercado', defaultWeight: 0.12 },
  { id: 'pqc', name: 'Post-quantum readiness', defaultWeight: 0.14 },
  { id: 'timing', name: 'Ventana temporal', defaultWeight: 0.1 },
  { id: 'evidence', name: 'Evidencia / reducción a práctica', defaultWeight: 0.1 },
] as const;

export type RiiScores = Record<(typeof RII_CRITERIA)[number]['id'], number>;

/**
 * Índice de IP Revolucionaria (RII) ∈ [0,100]
 * RII = 100 * Σ w_i * s_i   con w de AHP, s_i ∈ [0,1]
 */
export function revolutionaryIpIndex(
  scores: RiiScores,
  customWeights?: number[],
): {
  rii: number;
  weights: number[];
  weighted: { id: string; name: string; score: number; weight: number; contrib: number }[];
  ahp: ReturnType<typeof ahpPriorities>;
  grade: string;
} {
  const base = customWeights ?? RII_CRITERIA.map((c) => c.defaultWeight);
  const pairwise = buildPairwiseFromWeights(base);
  const ahp = ahpPriorities(pairwise);
  const weighted = RII_CRITERIA.map((c, i) => {
    const score = clamp(scores[c.id], 0, 1);
    const weight = ahp.priorities[i];
    return {
      id: c.id,
      name: c.name,
      score,
      weight,
      contrib: weight * score,
    };
  });
  const rii = 100 * weighted.reduce((s, w) => s + w.contrib, 0);
  let grade = 'D';
  if (rii >= 85) grade = 'S';
  else if (rii >= 75) grade = 'A';
  else if (rii >= 65) grade = 'B';
  else if (rii >= 50) grade = 'C';
  return { rii, weights: ahp.priorities, weighted, ahp, grade };
}

/**
 * Novedad por entropía del landscape de prior art.
 * shares[] = cuotas relativas de familias/patentes en el espacio.
 * concentration (HHI) y Ĥ se combinan:
 * novelty = 0.6*Ĥ + 0.4*(1 - HHI_norm)
 */
export function landscapeNovelty(shares: number[]): {
  entropy: number;
  normalizedEntropy: number;
  hhi: number;
  novelty: number;
} {
  const p = normalizeProbs(shares);
  const h = shannonEntropy(p);
  const hn = normalizedEntropy(shares);
  const hhi = p.reduce((s, pi) => s + pi * pi, 0); // Herfindahl-Hirschman
  // HHI ∈ [1/n, 1] → normalizar a [0,1] donde 1 = monopolio
  const n = p.length;
  const hhiMin = 1 / Math.max(1, n);
  const hhiNorm = n > 1 ? (hhi - hhiMin) / (1 - hhiMin) : 1;
  const novelty = clamp(0.6 * hn + 0.4 * (1 - hhiNorm), 0, 1);
  return { entropy: h, normalizedEntropy: hn, hhi, novelty };
}

/**
 * Métricas estructurales del claim tree (DAG arborescente).
 * - depth, branching factor
 * - structural balance: geometric mean(breadth of independents, specificity of leaves)
 * - defensibility proxy: Σ specificity_leaf * breadth_root_path
 */
export function claimGraphMetrics(nodes: ClaimNode[]): {
  n: number;
  nIndependent: number;
  maxDepth: number;
  avgBranching: number;
  defensibility: number;
  structuralScore: number;
  adjacencySpectralRadius: number;
  conditionHint: number;
} {
  if (!nodes.length) {
    return {
      n: 0,
      nIndependent: 0,
      maxDepth: 0,
      avgBranching: 0,
      defensibility: 0,
      structuralScore: 0,
      adjacencySpectralRadius: 0,
      conditionHint: 0,
    };
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.parentId) {
      const arr = children.get(n.parentId) ?? [];
      arr.push(n.id);
      children.set(n.parentId, arr);
    }
  }

  function depthOf(id: string, seen = new Set<string>()): number {
    if (seen.has(id)) return 0;
    seen.add(id);
    const node = byId.get(id);
    if (!node?.parentId) return 0;
    return 1 + depthOf(node.parentId, seen);
  }

  const depths = nodes.map((n) => depthOf(n.id));
  const maxDepth = Math.max(...depths, 0);
  const branchCounts = nodes.map((n) => (children.get(n.id) ?? []).length);
  const parents = branchCounts.filter((b) => b > 0);
  const avgBranching = parents.length ? parents.reduce((a, b) => a + b, 0) / parents.length : 0;

  const independents = nodes.filter((n) => n.kind === 'independent' || !n.parentId);
  const leaves = nodes.filter((n) => (children.get(n.id) ?? []).length === 0);

  let defSum = 0;
  for (const leaf of leaves) {
    let breadthPath = 1;
    let cur: ClaimNode | undefined = leaf;
    const guard = new Set<string>();
    while (cur && !guard.has(cur.id)) {
      guard.add(cur.id);
      breadthPath *= 0.5 + 0.5 * cur.breadth;
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    defSum += leaf.specificity * breadthPath;
  }
  const defensibility = clamp(defSum / Math.max(1, leaves.length), 0, 1);

  const structuralScore = geometricMean([
    independents.length ? mean(independents.map((i) => i.breadth)) : 0.1,
    leaves.length ? mean(leaves.map((l) => l.specificity)) : 0.1,
    clamp(avgBranching / 3, 0.05, 1),
    clamp(maxDepth / 5, 0.05, 1),
  ]);

  // Matriz de adyacencia no dirigida para radio espectral (conectividad)
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const N = nodes.length;
  const A: Matrix = Array.from({ length: N }, () => Array(N).fill(0));
  for (const n of nodes) {
    if (n.parentId && idx.has(n.parentId)) {
      const i = idx.get(n.id)!;
      const j = idx.get(n.parentId)!;
      A[i][j] = 1;
      A[j][i] = 1;
    }
  }
  const { eigenvalue } = N > 0 ? powerIteration(A) : { eigenvalue: 0 };
  let conditionHint = 0;
  try {
    // Laplacian L = D - A para ver mal-condicionamiento del grafo
    const L: Matrix = Array.from({ length: N }, () => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      let deg = 0;
      for (let j = 0; j < N; j++) deg += A[i][j];
      L[i][i] = deg + 1e-3; // regularizado
      for (let j = 0; j < N; j++) if (i !== j) L[i][j] = -A[i][j];
    }
    const kappa = approxConditionNumber(L);
    conditionHint = clamp(1 / (1 + Math.log10(1 + kappa)), 0, 1);
  } catch {
    conditionHint = 0.5;
  }

  return {
    n: N,
    nIndependent: independents.length,
    maxDepth,
    avgBranching,
    defensibility,
    structuralScore,
    adjacencySpectralRadius: Math.abs(eigenvalue),
    conditionHint,
  };
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

/**
 * Mapea progreso del proyecto a scores RII (0..1).
 */
export function deriveRiiFromProjectSignals(signals: {
  stageScores: number[]; // 0..100 cada etapa
  pqrl: number; // 1..9
  trl: number;
  iprl: number;
  landscapeShares: number[];
  claimNodes: ClaimNode[];
  hybridMode: boolean;
  hndlUrgency: number; // 0..100
  ipAssetCount: number;
}): RiiScores {
  const stages = signals.stageScores;
  const avg = (a: number, b: number) => {
    const slice = stages.slice(a, b + 1);
    return slice.length ? slice.reduce((x, y) => x + y, 0) / slice.length / 100 : 0;
  };

  const land = landscapeNovelty(
    signals.landscapeShares.length ? signals.landscapeShares : [1, 1, 1, 1, 1],
  );
  const claims = claimGraphMetrics(signals.claimNodes);

  const novelty = clamp(0.55 * land.novelty + 0.25 * avg(0, 2) + 0.2 * claims.structuralScore, 0, 1);
  const defensibility = clamp(
    0.5 * claims.defensibility + 0.3 * (signals.iprl / 9) + 0.2 * avg(3, 3),
    0,
    1,
  );
  const feasibility = clamp(0.5 * (signals.trl / 9) + 0.5 * avg(4, 5), 0, 1);
  const market = clamp(0.4 * avg(8, 9) + 0.3 * sigmoid(signals.ipAssetCount - 1) + 0.3 * avg(1, 1), 0, 1);
  const pqc = clamp(
    0.55 * (signals.pqrl / 9) + 0.25 * avg(6, 6) + 0.2 * (signals.hybridMode ? 0.85 : 0.55),
    0,
    1,
  );
  // Timing: alta urgencia HNDL + etapa temprana bien hecha
  const timing = clamp(
    0.5 * (signals.hndlUrgency / 100) + 0.3 * (1 - avg(9, 9)) * avg(0, 1) + 0.2 * land.novelty,
    0,
    1,
  );
  const evidence = clamp(0.45 * avg(5, 5) + 0.35 * avg(7, 8) + 0.2 * (signals.ipAssetCount > 0 ? 0.8 : 0.2), 0, 1);

  return { novelty, defensibility, feasibility, market, pqc, timing, evidence };
}

/**
 * Proyección de valor de IP: V = V0 * RII/100 * e^{-δ t} * (1 + g)^{t}
 * con incertidumbre en g (crecimiento) vía softmax de escenarios.
 */
export function ipValueProjection(params: {
  v0: number;
  rii: number;
  years: number;
  discount: number;
  growthScenarios: number[]; // tasas g
  scenarioLogits?: number[];
}): { scenarios: { g: number; value: number; prob: number }[]; expectedValue: number } {
  const logits = params.scenarioLogits ?? params.growthScenarios.map(() => 1);
  const probs = softmax(logits, 1);
  const scenarios = params.growthScenarios.map((g, i) => {
    const t = params.years;
    const value =
      params.v0 *
      (params.rii / 100) *
      Math.exp(-params.discount * t) *
      Math.pow(1 + g, t);
    return { g, value, prob: probs[i] };
  });
  const expectedValue = scenarios.reduce((s, sc) => s + sc.prob * sc.value, 0);
  return { scenarios, expectedValue };
}
