/**
 * Modelos matemáticos post-cuánticos.
 * Referencias conceptuales: Grover O(2^{n/2}), Shor, composición híbrida min-security,
 * estimaciones de coste de ataque y horizonte HNDL.
 */

import { clamp, gaussian, logNormal, monteCarlo, sigmoid } from './stats';

/** Bits de seguridad clásicos vs post-cuánticos (Grover: √ del espacio) */
export function groverEffectiveBits(classicalBits: number): number {
  return classicalBits / 2;
}

/**
 * Seguridad efectiva de un esquema híbrido (AND composition):
 * S_hybrid = min(S_classical, S_pqc) bajo el modelo de ruptura independiente.
 * Con correlación ρ opcional (cota de Fréchet-Hoeffding relajada).
 */
export function hybridSecurityBits(
  classicalBits: number,
  pqcBits: number,
  correlation = 0,
): number {
  const indep = Math.min(classicalBits, pqcBits);
  // Penalización por correlación positiva entre fallos (adversario comparte side-channels)
  const penalty = correlation * 0.15 * Math.min(classicalBits, pqcBits);
  return Math.max(0, indep - penalty);
}

/**
 * Coste de ataque tipo Grover (órdenes de magnitud, no wall-clock real):
 * C ≈ 2^{k/2} * poly(n) — devolvemos log2 del coste.
 */
export function log2GroverCost(securityBits: number, polyFactorBits = 10): number {
  return securityBits / 2 + polyFactorBits;
}

/**
 * Modelo logístico de llegada de CRQC (computadora cuántica criptográficamente relevante).
 * P(T ≤ t) = 1 / (1 + exp(-k(t - t0)))
 * t en años desde 2024.
 */
export function crqcArrivalCdf(tYearsFrom2024: number, t0 = 12, k = 0.45): number {
  return sigmoid(k * (tYearsFrom2024 - t0));
}

/**
 * Valor en riesgo HNDL: probabilidad de que datos con vida útil L años
 * sean descifrables por CRQC antes de expirar su sensibilidad.
 *
 * P_HNDL = P(T_CRQC < L) ≈ CDF_CRQC(L)
 * ExpectedLoss ≈ value * P_HNDL * (1 - pqcCoverage)
 */
export function hndlRisk(params: {
  dataLifetimeYears: number;
  assetValue: number;
  pqcCoverage: number; // 0..1
  crqcMedianYearFrom2024?: number;
  crqcSteepness?: number;
}): {
  pBreach: number;
  expectedLoss: number;
  residualRisk: number;
  urgencyScore: number;
} {
  const t0 = params.crqcMedianYearFrom2024 ?? 12;
  const k = params.crqcSteepness ?? 0.45;
  const pBreach = crqcArrivalCdf(params.dataLifetimeYears, t0, k);
  const coverage = clamp(params.pqcCoverage, 0, 1);
  const residual = pBreach * (1 - coverage);
  const expectedLoss = params.assetValue * residual;
  // Urgencia: alta si vida larga, coverage baja, P_breach alta
  const urgencyScore = clamp(
    100 * residual * (0.5 + 0.5 * sigmoid((params.dataLifetimeYears - 8) / 3)),
    0,
    100,
  );
  return { pBreach, expectedLoss, residualRisk: residual, urgencyScore };
}

/**
 * Monte Carlo HNDL: incertidumbre en t0 (mediana CRQC) y valor del activo.
 */
export function hndlMonteCarlo(params: {
  dataLifetimeYears: number;
  assetValueMean: number;
  assetValueCv?: number; // coef. variación
  pqcCoverage: number;
  t0Mean?: number;
  t0Std?: number;
  n?: number;
  seed?: number;
}): {
  expectedLossMean: number;
  expectedLossP95: number;
  pBreachMean: number;
  urgencyMean: number;
  var95: number; // Value-at-Risk 95% de la pérdida
} {
  const cv = params.assetValueCv ?? 0.35;
  const t0Mean = params.t0Mean ?? 12;
  const t0Std = params.t0Std ?? 3.5;
  const n = params.n ?? 4000;
  const seed = params.seed ?? 7;

  // μ,σ de lognormal para valor: E[X]=m, CV=cv → σ² = ln(1+cv²), μ = ln(m) - σ²/2
  const sigma = Math.sqrt(Math.log(1 + cv * cv));
  const mu = Math.log(Math.max(1e-9, params.assetValueMean)) - 0.5 * sigma * sigma;

  const lossMc = monteCarlo(
    (rng) => {
      const t0 = Math.max(3, gaussian(rng, t0Mean, t0Std));
      const value = logNormal(rng, mu, sigma);
      const r = hndlRisk({
        dataLifetimeYears: params.dataLifetimeYears,
        assetValue: value,
        pqcCoverage: params.pqcCoverage,
        crqcMedianYearFrom2024: t0,
      });
      return r.expectedLoss;
    },
    n,
    seed,
  );

  const breachMc = monteCarlo(
    (rng) => {
      const t0 = Math.max(3, gaussian(rng, t0Mean, t0Std));
      return crqcArrivalCdf(params.dataLifetimeYears, t0, 0.45);
    },
    n,
    seed + 1,
  );

  const urgencyMc = monteCarlo(
    (rng) => {
      const t0 = Math.max(3, gaussian(rng, t0Mean, t0Std));
      return hndlRisk({
        dataLifetimeYears: params.dataLifetimeYears,
        assetValue: params.assetValueMean,
        pqcCoverage: params.pqcCoverage,
        crqcMedianYearFrom2024: t0,
      }).urgencyScore;
    },
    n,
    seed + 2,
  );

  return {
    expectedLossMean: lossMc.mean,
    expectedLossP95: lossMc.p95,
    pBreachMean: breachMc.mean,
    urgencyMean: urgencyMc.mean,
    var95: lossMc.p95,
  };
}

/** Parámetros de referencia NIST (órdenes de magnitud, bytes) */
export const PQC_PARAM_TABLE = {
  'ML-KEM-512': { pqBits: 128, pk: 800, ct: 768, sk: 1632 },
  'ML-KEM-768': { pqBits: 192, pk: 1184, ct: 1088, sk: 2400 },
  'ML-KEM-1024': { pqBits: 256, pk: 1568, ct: 1568, sk: 3168 },
  'ML-DSA-44': { pqBits: 128, pk: 1312, sig: 2420 },
  'ML-DSA-65': { pqBits: 192, pk: 1952, sig: 3309 },
  'ML-DSA-87': { pqBits: 256, pk: 2592, sig: 4627 },
  'SLH-DSA-128s': { pqBits: 128, pk: 32, sig: 7856 },
  'SLH-DSA-192s': { pqBits: 192, pk: 48, sig: 16224 },
  'X25519': { pqBits: 128, classicalBits: 128, pk: 32, ct: 32 },
  'P-256': { pqBits: 128, classicalBits: 128, pk: 64, ct: 64 },
  'RSA-2048': { pqBits: 0, classicalBits: 112, pk: 256, ct: 256 },
  'RSA-3072': { pqBits: 0, classicalBits: 128, pk: 384, ct: 384 },
} as const;

export type PqcParamKey = keyof typeof PQC_PARAM_TABLE;

/**
 * Overhead de handshake híbrido (bytes adicionales vs clásico puro).
 * Modelo: |pk_pqc| + |ct_pqc| + |sig_pqc| + overhead framing.
 */
export function hybridHandshakeOverhead(opts: {
  kem: keyof typeof PQC_PARAM_TABLE;
  sig: keyof typeof PQC_PARAM_TABLE;
  framingBytes?: number;
}): {
  totalBytes: number;
  kemBytes: number;
  sigBytes: number;
  relativeToX25519Ecdsa: number;
} {
  const kem = PQC_PARAM_TABLE[opts.kem] as { pk?: number; ct?: number; sig?: number };
  const sig = PQC_PARAM_TABLE[opts.sig] as { pk?: number; ct?: number; sig?: number };
  const kemBytes = (kem.pk ?? 0) + (kem.ct ?? 0);
  const sigBytes = (sig.pk ?? 0) + (sig.sig ?? 0);
  const framing = opts.framingBytes ?? 64;
  const total = kemBytes + sigBytes + framing;
  // baseline approx X25519 + ECDSA-P256 ≈ 32+32+64+64
  const baseline = 200;
  return {
    totalBytes: total,
    kemBytes,
    sigBytes,
    relativeToX25519Ecdsa: total / baseline,
  };
}

/**
 * Función de utilidad crypto-agility:
 * U = α·security + β·(1/overhead) + γ·agility − δ·complexity
 * normalizada a [0,100].
 */
export function cryptoAgilityUtility(params: {
  securityBits: number;
  overheadRatio: number;
  algorithmCount: number; // diversidad algorítmica
  implementationComplexity: number; // 1..10
  weights?: { a: number; b: number; c: number; d: number };
}): number {
  const w = params.weights ?? { a: 0.45, b: 0.2, c: 0.2, d: 0.15 };
  const sec = clamp(params.securityBits / 256, 0, 1);
  const oh = clamp(1 / Math.max(0.5, params.overheadRatio), 0, 1);
  const ag = clamp(params.algorithmCount / 4, 0, 1);
  const cx = 1 - clamp(params.implementationComplexity / 10, 0, 1);
  return 100 * (w.a * sec + w.b * oh + w.c * ag + w.d * cx);
}

/**
 * Estimación de bits PQ a partir del nombre de stack del proyecto.
 */
export function inferStackSecurity(kem: string, signature: string, hybrid: boolean): {
  classicalBits: number;
  pqcBits: number;
  effectiveBits: number;
} {
  const pick = (name: string, role: 'kem' | 'sig') => {
    const u = name.toUpperCase();
    if (u.includes('1024') || u.includes('87')) return 256;
    if (u.includes('768') || u.includes('65') || u.includes('192')) return 192;
    if (u.includes('512') || u.includes('44') || u.includes('128')) return 128;
    if (u.includes('SLH')) return role === 'sig' ? 128 : 0;
    if (u.includes('RSA-2048')) return 0;
    return 192;
  };
  const pqcBits = Math.min(pick(kem, 'kem'), pick(signature, 'sig'));
  const classicalBits = hybrid || /X25519|ECDH|P-256|ECDSA/i.test(kem + signature) ? 128 : 0;
  const effectiveBits = hybrid
    ? hybridSecurityBits(classicalBits || 128, pqcBits)
    : pqcBits;
  return { classicalBits: classicalBits || (hybrid ? 128 : 0), pqcBits, effectiveBits };
}

/**
 * Curva de coste de migración vs cobertura PQC (convexa).
 * Cost(c) = C0 * (e^{λc} - 1) / (e^λ - 1)  — marginal creciente.
 */
export function migrationCostCurve(coverage: number, c0 = 1e6, lambda = 2.2): number {
  const c = clamp(coverage, 0, 1);
  return c0 * (Math.exp(lambda * c) - 1) / (Math.exp(lambda) - 1);
}

/**
 * Optimización 1D: maximiza value*coverage*riskReduction - cost(coverage)
 * por grid search (estructuralmente simple, robusto).
 */
export function optimalCoverage(params: {
  assetValue: number;
  dataLifetimeYears: number;
  c0?: number;
  lambda?: number;
}): { coverage: number; netUtility: number; cost: number; residualRisk: number } {
  let best = { coverage: 0, netUtility: -Infinity, cost: 0, residualRisk: 1 };
  for (let i = 0; i <= 100; i++) {
    const c = i / 100;
    const risk = hndlRisk({
      dataLifetimeYears: params.dataLifetimeYears,
      assetValue: params.assetValue,
      pqcCoverage: c,
    });
    const cost = migrationCostCurve(c, params.c0 ?? 1e6, params.lambda ?? 2.2);
    const utility = params.assetValue * (1 - risk.residualRisk) - cost;
    if (utility > best.netUtility) {
      best = {
        coverage: c,
        netUtility: utility,
        cost,
        residualRisk: risk.residualRisk,
      };
    }
  }
  return best;
}
