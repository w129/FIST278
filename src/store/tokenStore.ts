import type { AssetToken, RegistryStats, TokenizeInput } from '../types/token';
import { sealToken, tokenizeAsset } from '../core/tokenize';
import { applyValidationToToken, validateToken, type ValidateOptions } from '../core/validate';
import {
  certificateFromUpload,
  issueHashCodCertificate,
} from '../core/hashcodCertificate';

const STORAGE_KEY = 'FIST278.v3.tokens';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadTokens(): AssetToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTokens();
    const parsed = JSON.parse(raw) as AssetToken[];
    return Array.isArray(parsed) ? parsed : seedTokens();
  } catch {
    return seedTokens();
  }
}

export function saveTokens(tokens: AssetToken[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function upsertToken(tokens: AssetToken[], token: AssetToken): AssetToken[] {
  const next = tokens.some((t) => t.id === token.id)
    ? tokens.map((t) => (t.id === token.id ? token : t))
    : [token, ...tokens];
  saveTokens(next);
  return next;
}

export function deleteToken(tokens: AssetToken[], id: string): AssetToken[] {
  const next = tokens.filter((t) => t.id !== id);
  saveTokens(next);
  return next;
}

export async function createTokenizedAsset(
  tokens: AssetToken[],
  input: TokenizeInput,
): Promise<{ tokens: AssetToken[]; token: AssetToken }> {
  const token = await tokenizeAsset(input, tokens);
  const next = upsertToken(tokens, token);
  return { tokens: next, token };
}

export async function runValidation(
  tokens: AssetToken[],
  tokenId: string,
  opts: ValidateOptions = {},
): Promise<{ tokens: AssetToken[]; token: AssetToken }> {
  const token = tokens.find((t) => t.id === tokenId);
  if (!token) throw new Error('Token no encontrado');
  const report = await validateToken(token, tokens, opts);
  const updated = applyValidationToToken(token, report);
  return { tokens: upsertToken(tokens, updated), token: updated };
}

/**
 * Emite Certificado hashcod (HVC) y lo adjunta al token.
 * Requerido por FIST278 para que la validación pueda dar pass.
 */
export async function issueAndAttachHashCodCert(
  tokens: AssetToken[],
  tokenId: string,
  opts?: { subject?: string; issuedBy?: string; hashcodKey?: string },
): Promise<{ tokens: AssetToken[]; token: AssetToken }> {
  const token = tokens.find((t) => t.id === tokenId);
  if (!token) throw new Error('Token no encontrado');
  const existing = tokens
    .map((t) => t.hashcodCertificate)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const cert = await issueHashCodCertificate(token, {
    existingCerts: existing,
    subject: opts?.subject,
    issuedBy: opts?.issuedBy,
    hashcodKey: opts?.hashcodKey,
  });
  const updated: AssetToken = {
    ...token,
    hashcodCertificate: cert,
    standardId: 'FIST278',
    updatedAt: new Date().toISOString(),
  };
  return { tokens: upsertToken(tokens, updated), token: updated };
}

/**
 * Sube certificado hashcod: el archivo/texto DEBE presentar clave
 * > |||||------|---|-|-|-|||…| <
 */
export async function uploadAndAttachHashCodCert(
  tokens: AssetToken[],
  tokenId: string,
  rawUpload: string,
  opts?: { subject?: string },
): Promise<{ tokens: AssetToken[]; token: AssetToken }> {
  const token = tokens.find((t) => t.id === tokenId);
  if (!token) throw new Error('Token no encontrado');
  const existing = tokens
    .map((t) => t.hashcodCertificate)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const cert = await certificateFromUpload(token, rawUpload, {
    existingCerts: existing,
    subject: opts?.subject,
  });
  const updated: AssetToken = {
    ...token,
    hashcodCertificate: cert,
    standardId: 'FIST278',
    // Si había pass previo sin esta clave, forzar revalidación
    status: token.status === 'validated' || token.status === 'sealed' ? 'tokenized' : token.status,
    latestValidation: undefined,
    updatedAt: new Date().toISOString(),
  };
  return { tokens: upsertToken(tokens, updated), token: updated };
}

export async function sealValidatedToken(
  tokens: AssetToken[],
  tokenId: string,
): Promise<{ tokens: AssetToken[]; token: AssetToken }> {
  const token = tokens.find((t) => t.id === tokenId);
  if (!token) throw new Error('Token no encontrado');
  if (token.status !== 'validated' && token.status !== 'sealed') {
    throw new Error('Solo se pueden sellar tokens validados');
  }
  const sealed = await sealToken(token);
  return { tokens: upsertToken(tokens, sealed), token: sealed };
}

export function registryStats(tokens: AssetToken[]): RegistryStats {
  const total = tokens.length;
  const tokenized = tokens.filter((t) =>
    ['tokenized', 'validating', 'validated', 'sealed'].includes(t.status),
  ).length;
  const validated = tokens.filter((t) => t.status === 'validated' || t.status === 'sealed').length;
  const rejected = tokens.filter((t) => t.status === 'rejected').length;
  const sealed = tokens.filter((t) => t.status === 'sealed').length;
  const scores = tokens
    .map((t) => t.latestValidation?.compositeScore)
    .filter((s): s is number => typeof s === 'number');
  const avgValidationScore = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  const uniqueModels = new Set(tokens.map((t) => t.asset.modelId)).size;
  return {
    total,
    tokenized,
    validated,
    rejected,
    sealed,
    avgValidationScore,
    uniqueModels,
  };
}

function seedTokens(): AssetToken[] {
  // Sync seed with precomputed-like structure via async is hard; store empty and let UI demo
  // Create minimal demo synchronously by calling tokenize in bootstrap
  const demo: AssetToken[] = [];
  saveTokens(demo);
  // Fire-and-forget seed will be done from context on empty + flag
  void uid;
  return demo;
}

export async function ensureDemoTokens(tokens: AssetToken[]): Promise<AssetToken[]> {
  if (tokens.length > 0) return tokens;
  const samples: TokenizeInput[] = [
    {
      title: 'Protocolo de attestation para outputs LLM',
      kind: 'protocol',
      description: 'Esquema de commitment hash + metadata de modelo para activos IA.',
      modelId: 'grok-4',
      prompt:
        'Diseña un protocolo de attestation para salidas de modelos de lenguaje con hash de contenido y divulgación de modelo.',
      steward: 'Equipo FIST278',
      licenseIntent: 'dual',
      tags: ['IA', 'attestation', 'token'],
      language: 'es',
      content: `# Protocolo FIST278-Attest v0.1

## Objetivo
Producir un token verificable de un activo generado por IA mediante:
1. Canonicalización del contenido
2. SHA-256 del cuerpo y del prompt
3. Envelope de metadata ordenado lexicográficamente
4. Commitment H(contentHash || metadataHash || serial)

## Validación
Gates: integridad, divulgación IA, originalidad (Jaccard trigramas), calidad, política, revisión humana.

## Notas
Este activo es un ejemplo del registro FIST278 para demostrar tokenización y validación.
`,
    },
    {
      title: 'Snippet utilitario de fingerprint',
      kind: 'code',
      description: 'Función de ejemplo tokenizada',
      modelId: 'local-llm',
      prompt: 'Escribe una función TypeScript que genere fingerprint corto de un hash',
      steward: 'Demo',
      licenseIntent: 'open',
      tags: ['code', 'demo'],
      language: 'ts',
      content: `export function shortFingerprint(hash: string, n = 12): string {
  return hash.slice(0, n).toUpperCase();
}

export function assertHex(h: string): boolean {
  return /^[0-9a-f]+$/i.test(h);
}
`,
    },
  ];
  let list = tokens;
  for (const s of samples) {
    const { tokens: next } = await createTokenizedAsset(list, s);
    list = next;
  }
  // Demo: emitir Certificado hashcod + validar + sellar
  if (list[0]) {
    const withCert = await issueAndAttachHashCodCert(list, list[0].id, {
      subject: 'Demo hashcod · FIST278',
      issuedBy: 'hashcod International Standards Authority',
    });
    list = withCert.tokens;
    const r = await runValidation(list, list[0].id, {
      humanApproved: true,
      humanNotes: 'Demo seed: conformidad FIST278 con Certificado hashcod',
    });
    list = r.tokens;
    try {
      const sealed = await sealValidatedToken(list, list[0].id);
      list = sealed.tokens;
    } catch {
      /* ignore si aún no pass */
    }
  }
  return list;
}
