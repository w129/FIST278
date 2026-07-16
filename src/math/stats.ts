/**
 * Estadística, entropía e integración Monte Carlo para FIST278.
 */

/** PRNG determinista (Mulberry32) para simulaciones reproducibles */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function variance(xs: number[], sample = true): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const s = xs.reduce((a, x) => a + (x - m) ** 2, 0);
  return s / (sample ? xs.length - 1 : xs.length);
}

export function std(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

export function percentile(xs: number[], p: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return s[lo];
  return s[lo] * (hi - idx) + s[hi] * (idx - lo);
}

/** Entropía de Shannon H(p) = -Σ p_i log2 p_i */
export function shannonEntropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/** Normaliza pesos no negativos a distribución de probabilidad */
export function normalizeProbs(weights: number[]): number[] {
  const s = weights.reduce((a, b) => a + Math.max(0, b), 0);
  if (s <= 0) return weights.map(() => 1 / Math.max(1, weights.length));
  return weights.map((w) => Math.max(0, w) / s);
}

/**
 * Entropía normalizada Ĥ ∈ [0,1]: diversidad del landscape / white-space proxy.
 * Ĥ → 1: espacio fragmentado (más white space potencial).
 * Ĥ → 0: monopolio / prior art concentrado.
 */
export function normalizedEntropy(weights: number[]): number {
  const p = normalizeProbs(weights);
  const h = shannonEntropy(p);
  const hmax = Math.log2(Math.max(1, p.length));
  return hmax > 0 ? h / hmax : 0;
}

/** Box-Muller N(μ,σ²) */
export function gaussian(rng: () => number, mu = 0, sigma = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mu + sigma * z;
}

/** Log-normal: exp(N(μ,σ²)) */
export function logNormal(rng: () => number, mu: number, sigma: number): number {
  return Math.exp(gaussian(rng, mu, sigma));
}

/**
 * Monte Carlo genérico: estima E[f(X)], Var, IC 95%.
 */
export function monteCarlo(
  f: (rng: () => number) => number,
  n: number,
  seed = 42,
): { mean: number; std: number; p05: number; p50: number; p95: number; samples: number[] } {
  const rng = mulberry32(seed);
  const samples: number[] = [];
  for (let i = 0; i < n; i++) samples.push(f(rng));
  return {
    mean: mean(samples),
    std: std(samples),
    p05: percentile(samples, 5),
    p50: percentile(samples, 50),
    p95: percentile(samples, 95),
    samples,
  };
}

/** CDF empírica en x */
export function ecdf(samples: number[], x: number): number {
  if (!samples.length) return 0;
  return samples.filter((s) => s <= x).length / samples.length;
}

/**
 * Integración de Simpson 1/3 en [a,b].
 */
export function simpson(f: (x: number) => number, a: number, b: number, n = 200): number {
  if (n % 2 === 1) n += 1;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    s += f(x) * (i % 2 === 0 ? 2 : 4);
  }
  return (h / 3) * s;
}

/** Softmax estable */
export function softmax(logits: number[], temperature = 1): number[] {
  const t = Math.max(1e-9, temperature);
  const m = Math.max(...logits);
  const exps = logits.map((z) => Math.exp((z - m) / t));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}

/** Clamp */
export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/** Sigmoide */
export function sigmoid(x: number): number {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  }
  const z = Math.exp(x);
  return z / (1 + z);
}

/** Media geométrica (para índices compuestos) */
export function geometricMean(xs: number[]): number {
  const pos = xs.filter((x) => x > 0);
  if (!pos.length) return 0;
  const logAvg = pos.reduce((s, x) => s + Math.log(x), 0) / pos.length;
  return Math.exp(logAvg);
}

/** Media armónica */
export function harmonicMean(xs: number[]): number {
  const pos = xs.filter((x) => x > 0);
  if (!pos.length) return 0;
  return pos.length / pos.reduce((s, x) => s + 1 / x, 0);
}
