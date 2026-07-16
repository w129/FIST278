/**
 * Motor unificado FIST278: agrega métricas matemáticas por proyecto y portafolio.
 */

import type { ClaimNode, Project } from '../types';
// ClaimNode re-exported for UI convenience
import { STAGES } from '../data/methodology';
import {
  claimGraphMetrics,
  deriveRiiFromProjectSignals,
  ipValueProjection,
  landscapeNovelty,
  revolutionaryIpIndex,
  type RiiScores,
} from './ip_scoring';
import {
  hndlMonteCarlo,
  hndlRisk,
  hybridHandshakeOverhead,
  inferStackSecurity,
  optimalCoverage,
  cryptoAgilityUtility,
  type PqcParamKey,
} from './pqc';
import {
  ipPqcCoupling,
  optimalEffortAllocation,
  portfolioSoftmaxRanks,
  probReachedStage,
  simulateReadinessPath,
  stageDistributionForward,
} from './dynamics';
import { clamp } from './stats';

export type ProjectMathReport = {
  projectId: string;
  rii: number;
  grade: string;
  riiBreakdown: ReturnType<typeof revolutionaryIpIndex>['weighted'];
  ahpCR: number;
  ahpConsistent: boolean;
  scores: RiiScores;
  landscape: ReturnType<typeof landscapeNovelty>;
  claims: ReturnType<typeof claimGraphMetrics>;
  stackSecurity: ReturnType<typeof inferStackSecurity>;
  hndl: ReturnType<typeof hndlRisk>;
  hndlMc: ReturnType<typeof hndlMonteCarlo>;
  optimalPqcCoverage: ReturnType<typeof optimalCoverage>;
  handshake?: ReturnType<typeof hybridHandshakeOverhead>;
  agility: number;
  coupling: number;
  effort: ReturnType<typeof optimalEffortAllocation>;
  markov: { dist8: number[]; pReachS6: number; pReachS9: number };
  readinessPath: { trl: number; iprl: number; pqrl: number }[];
  valueProjection: ReturnType<typeof ipValueProjection>;
  compositeScore: number;
};

function defaultClaims(project: Project): ClaimNode[] {
  if (project.claimNodes?.length) return project.claimNodes;
  // Grafo sintético estructural a partir de activos IP
  if (project.ipAssets.length) {
    const root: ClaimNode = {
      id: 'c_ind_1',
      label: project.ipAssets[0].title.slice(0, 60),
      kind: 'independent',
      breadth: 0.72,
      specificity: 0.4,
    };
    const deps: ClaimNode[] = project.ipAssets.slice(0, 4).map((a, i) => ({
      id: `c_dep_${i}`,
      label: a.noveltyClaim.slice(0, 50) || a.title,
      kind: i % 2 === 0 ? 'dependent' : 'method',
      breadth: 0.45 + 0.1 * (i % 3),
      specificity: 0.55 + 0.08 * i,
      parentId: 'c_ind_1',
    }));
    return [root, ...deps];
  }
  return [
    {
      id: 'c_ind_1',
      label: 'Claim independiente principal',
      kind: 'independent',
      breadth: 0.65,
      specificity: 0.35,
    },
    {
      id: 'c_dep_1',
      label: 'Embodiment preferido',
      kind: 'dependent',
      breadth: 0.4,
      specificity: 0.7,
      parentId: 'c_ind_1',
    },
    {
      id: 'c_m_1',
      label: 'Método',
      kind: 'method',
      breadth: 0.5,
      specificity: 0.6,
      parentId: 'c_ind_1',
    },
  ];
}

function landscapeShares(project: Project): number[] {
  if (project.landscapeShares?.length) return project.landscapeShares;
  // proxy: tags + domain diversifican
  const base = [3, 2, 2, 1.5, 1, 0.8, 0.5];
  if (project.domain === 'pqc-migration') return [4, 3, 2, 2, 1, 1];
  if (project.tags.length > 3) return base.map((b, i) => b * (1 + 0.1 * (project.tags.length - i)));
  return base;
}

export function analyzeProject(
  project: Project,
  opts?: {
    assetValue?: number;
    dataLifetimeYears?: number;
    claimNodes?: ClaimNode[];
  },
): ProjectMathReport {
  const stageScores = STAGES.map((s) => {
    const st = project.stages.find((x) => x.stageId === s.id);
    return st?.score ?? 0;
  });
  const claimsNodes = opts?.claimNodes ?? defaultClaims(project);
  const shares = landscapeShares(project);
  const assetValue = opts?.assetValue ?? project.economics?.assetValue ?? 2_500_000;
  const dataLife = opts?.dataLifetimeYears ?? project.economics?.dataLifetimeYears ?? 15;
  const coverage =
    project.stages.find((s) => s.stageId === 's6_pqc_hardening')?.score ?? 0;
  const pqcCoverage = clamp(coverage / 100, 0, 1) * (project.pqcStack.hybridMode ? 0.85 : 0.7);

  const hndl = hndlRisk({
    dataLifetimeYears: dataLife,
    assetValue,
    pqcCoverage,
  });
  const hndlMc = hndlMonteCarlo({
    dataLifetimeYears: dataLife,
    assetValueMean: assetValue,
    pqcCoverage,
    n: 2500,
    seed: hashSeed(project.id),
  });

  const scores = deriveRiiFromProjectSignals({
    stageScores,
    pqrl: project.pqrl,
    trl: project.trl,
    iprl: project.iprl,
    landscapeShares: shares,
    claimNodes: claimsNodes,
    hybridMode: project.pqcStack.hybridMode,
    hndlUrgency: hndl.urgencyScore,
    ipAssetCount: project.ipAssets.length,
  });

  // Ajuste con inputs manuales del proyecto si existen
  if (project.riiOverrides) {
    for (const k of Object.keys(project.riiOverrides) as (keyof RiiScores)[]) {
      if (project.riiOverrides[k] != null) scores[k] = project.riiOverrides[k]!;
    }
  }

  const riiResult = revolutionaryIpIndex(scores);
  const landscape = landscapeNovelty(shares);
  const claims = claimGraphMetrics(claimsNodes);
  const stackSecurity = inferStackSecurity(
    project.pqcStack.kem,
    project.pqcStack.signature,
    project.pqcStack.hybridMode,
  );

  let handshake: ReturnType<typeof hybridHandshakeOverhead> | undefined;
  try {
    const kemKey = pickKemKey(project.pqcStack.kem);
    const sigKey = pickSigKey(project.pqcStack.signature);
    if (kemKey && sigKey) handshake = hybridHandshakeOverhead({ kem: kemKey, sig: sigKey });
  } catch {
    handshake = undefined;
  }

  const agility = cryptoAgilityUtility({
    securityBits: stackSecurity.effectiveBits,
    overheadRatio: handshake?.relativeToX25519Ecdsa ?? 8,
    algorithmCount: project.pqcStack.hybridMode ? 3 : 2,
    implementationComplexity: 6,
  });

  const coupling = ipPqcCoupling(stageScores);
  const effort = optimalEffortAllocation({
    trl: project.trl,
    iprl: project.iprl,
    pqrl: project.pqrl,
    sensitivity: { tech: 1, ip: 1.1, pqc: 1.2 },
  });

  const rates = stageScores.map((sc) => 0.15 + 0.7 * (sc / 100));
  const dist8 = stageDistributionForward(rates, 8, firstActiveStage(stageScores));
  const markov = {
    dist8,
    pReachS6: probReachedStage(rates, 6, 12),
    pReachS9: probReachedStage(rates, 9, 20),
  };

  const readinessPath = simulateReadinessPath(
    { trl: project.trl, iprl: project.iprl, pqrl: project.pqrl },
    effort,
    8,
  );

  const valueProjection = ipValueProjection({
    v0: assetValue,
    rii: riiResult.rii,
    years: 5,
    discount: 0.08,
    growthScenarios: [-0.05, 0.05, 0.15, 0.3],
    scenarioLogits: [0.5, 1.2, 1.0, 0.4],
  });

  const optimalPqcCoverage = optimalCoverage({
    assetValue,
    dataLifetimeYears: dataLife,
  });

  // Score compuesto: media geométrica ponderada RII, security, (1-risk), structural
  const compositeScore =
    100 *
    Math.pow(
      Math.max(0.01, riiResult.rii / 100) ** 0.4 *
        Math.max(0.01, stackSecurity.effectiveBits / 256) ** 0.2 *
        Math.max(0.01, 1 - hndl.residualRisk) ** 0.2 *
        Math.max(0.01, claims.structuralScore) ** 0.2,
      1,
    );

  return {
    projectId: project.id,
    rii: riiResult.rii,
    grade: riiResult.grade,
    riiBreakdown: riiResult.weighted,
    ahpCR: riiResult.ahp.CR,
    ahpConsistent: riiResult.ahp.consistent,
    scores,
    landscape,
    claims,
    stackSecurity,
    hndl,
    hndlMc,
    optimalPqcCoverage,
    handshake,
    agility,
    coupling,
    effort,
    markov,
    readinessPath,
    valueProjection,
    compositeScore: clamp(compositeScore, 0, 100),
  };
}

export function analyzePortfolio(projects: Project[]): {
  reports: ProjectMathReport[];
  ranks: { id: string; name: string; codename: string; weight: number; rii: number; composite: number }[];
  portfolioRii: number;
  portfolioRisk: number;
  diversification: number;
} {
  const reports = projects.map((p) => analyzeProject(p));
  const weights = portfolioSoftmaxRanks(
    reports.map((r) => r.compositeScore),
    0.4,
  );
  const ranks = projects.map((p, i) => ({
    id: p.id,
    name: p.name,
    codename: p.codename,
    weight: weights[i] ?? 0,
    rii: reports[i].rii,
    composite: reports[i].compositeScore,
  }));
  ranks.sort((a, b) => b.weight - a.weight);

  const portfolioRii = ranks.reduce((s, r) => s + r.weight * r.rii, 0);
  const portfolioRisk = reports.reduce((s, r, i) => s + (weights[i] ?? 0) * r.hndl.residualRisk, 0);
  // diversificación = entropía normalizada de pesos
  const ent = -weights.filter((w) => w > 0).reduce((s, w) => s + w * Math.log2(w), 0);
  const diversification = weights.length > 1 ? ent / Math.log2(weights.length) : 0;

  return { reports, ranks, portfolioRii, portfolioRisk, diversification };
}

function firstActiveStage(scores: number[]): number {
  for (let i = scores.length - 1; i >= 0; i--) if (scores[i] > 0) return i;
  return 0;
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickKemKey(kem: string): PqcParamKey | null {
  if (/1024/i.test(kem)) return 'ML-KEM-1024';
  if (/768/i.test(kem)) return 'ML-KEM-768';
  if (/512/i.test(kem)) return 'ML-KEM-512';
  return 'ML-KEM-768';
}

function pickSigKey(sig: string): PqcParamKey | null {
  if (/87/i.test(sig)) return 'ML-DSA-87';
  if (/65/i.test(sig)) return 'ML-DSA-65';
  if (/44/i.test(sig)) return 'ML-DSA-44';
  if (/SLH/i.test(sig)) return 'SLH-DSA-128s';
  return 'ML-DSA-65';
}

export function formatNum(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return '—';
  if (Math.abs(x) >= 1e6) return `${(x / 1e6).toFixed(digits)}M`;
  if (Math.abs(x) >= 1e3) return `${(x / 1e3).toFixed(digits)}k`;
  return x.toFixed(digits);
}

export function formatPct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}
