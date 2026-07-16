/**
 * Extracción de features estructurales del activo IA
 * para scoring de originalidad, calidad y detección de plantillas.
 */

import type { TokenFeatures } from '../types/token';

const AI_PHRASES = [
  'as an ai',
  'as a language model',
  'i hope this helps',
  'in conclusion',
  'it is important to note',
  'delve into',
  'landscape of',
  'in today\'s world',
  'comprehensive guide',
  'unlock the potential',
  'game changer',
  'cutting-edge',
  'leverage',
  'harness the power',
  'en resumen',
  'es importante destacar',
  'en el mundo actual',
  'sin lugar a dudas',
];

export function extractFeatures(content: string, kind: string): TokenFeatures {
  const text = content || '';
  const chars = text.length;
  const lines = text.split(/\n/).length;
  const words = text.toLowerCase().match(/[\p{L}\p{N}_'-]+/gu) ?? [];
  const wordCount = words.length;
  const unique = new Set(words);
  const uniqueWordRatio = wordCount > 0 ? unique.size / wordCount : 0;

  const shannonEntropy = charEntropy(text);
  const trigramEntropy = ngramEntropy(text.toLowerCase().replace(/\s+/g, ' '), 3);
  const repetitionScore = computeRepetition(words);
  const codeSignal = computeCodeSignal(text);
  const aiPhraseSignal = computeAiPhraseSignal(text.toLowerCase());
  const structuralScore = computeStructural(text, kind, {
    wordCount,
    uniqueWordRatio,
    lines,
    codeSignal,
  });

  return {
    charCount: chars,
    wordCount,
    lineCount: lines,
    uniqueWordRatio,
    shannonEntropy,
    trigramEntropy,
    repetitionScore,
    codeSignal,
    aiPhraseSignal,
    structuralScore,
  };
}

function charEntropy(text: string): number {
  if (!text.length) return 0;
  const freq = new Map<string, number>();
  for (const ch of text) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  let h = 0;
  const n = text.length;
  for (const c of freq.values()) {
    const p = c / n;
    h -= p * Math.log2(p);
  }
  return h;
}

function ngramEntropy(text: string, n: number): number {
  if (text.length < n) return 0;
  const freq = new Map<string, number>();
  let total = 0;
  for (let i = 0; i <= text.length - n; i++) {
    const g = text.slice(i, i + n);
    freq.set(g, (freq.get(g) ?? 0) + 1);
    total++;
  }
  let h = 0;
  for (const c of freq.values()) {
    const p = c / total;
    h -= p * Math.log2(p);
  }
  return h;
}

function computeRepetition(words: string[]): number {
  if (words.length < 8) return 0.2;
  const freq = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  let rep = 0;
  let counted = 0;
  for (const [w, c] of freq) {
    if (c > 1) {
      rep += c / words.length;
      counted++;
    }
    void w;
  }
  // bigram repetition
  let bigramRep = 0;
  const bigrams = new Map<string, number>();
  for (let i = 0; i < words.length - 1; i++) {
    const bg = `${words[i]} ${words[i + 1]}`;
    bigrams.set(bg, (bigrams.get(bg) ?? 0) + 1);
  }
  for (const c of bigrams.values()) {
    if (c > 2) bigramRep += (c - 1) / Math.max(1, words.length);
  }
  return Math.min(1, 0.55 * rep + 0.45 * bigramRep + (counted === 0 ? 0.1 : 0));
}

function computeCodeSignal(text: string): number {
  const signals = [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /def\s+\w+\s*\(/,
    /class\s+\w+/,
    /import\s+.+from/,
    /#include\s*</,
    /=>\s*\{/,
    /;\s*$/m,
    /\{\s*[\s\S]*\}/,
    /console\.(log|error)/,
    /public\s+static/,
  ];
  let hits = 0;
  for (const re of signals) if (re.test(text)) hits++;
  const symbolDensity =
    (text.match(/[{}()[\];=<>]/g) ?? []).length / Math.max(1, text.length);
  return Math.min(1, hits / 8 + symbolDensity * 8);
}

function computeAiPhraseSignal(lower: string): number {
  let hits = 0;
  for (const p of AI_PHRASES) if (lower.includes(p)) hits++;
  return Math.min(1, hits / 6);
}

function computeStructural(
  text: string,
  kind: string,
  s: { wordCount: number; uniqueWordRatio: number; lines: number; codeSignal: number },
): number {
  let score = 0.3;
  if (s.wordCount >= 30) score += 0.15;
  if (s.wordCount >= 120) score += 0.1;
  if (s.uniqueWordRatio > 0.35) score += 0.15;
  if (s.lines >= 3) score += 0.1;
  if (/^#|\n## |^\*\*|^\d+\./m.test(text)) score += 0.1; // markdown/structure
  if (kind === 'code' || kind === 'protocol') score += s.codeSignal * 0.2;
  if (kind === 'invention-disclosure' && /claim|reivindic|método|system/i.test(text)) score += 0.1;
  return Math.max(0, Math.min(1, score));
}

/** Distancia de Jaccard entre sets de trigramas de palabras (originalidad vs registry) */
export function jaccardWordTrigrams(a: string, b: string): number {
  const ta = wordTrigrams(a);
  const tb = wordTrigrams(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union > 0 ? inter / union : 0;
}

function wordTrigrams(text: string): Set<string> {
  const words = text.toLowerCase().match(/[\p{L}\p{N}_'-]+/gu) ?? [];
  const set = new Set<string>();
  for (let i = 0; i < words.length - 2; i++) {
    set.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return set;
}
