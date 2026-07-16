/**
 * Motor de tokenización de activos generados por IA.
 * Función base de FIST278: asset IA → token con compromiso criptográfico.
 */

import type { AssetToken, TokenizeInput, TokenStatus } from '../types/token';
import {
  buildMetadataEnvelope,
  canonicalizeContent,
  commitmentHash,
  fingerprintFromHash,
  sealHash,
  sha256Hex,
} from './crypto';
import { extractFeatures } from './features';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function nextSerial(existing: AssetToken[]): string {
  const year = new Date().getFullYear();
  const prefix = `FST-${year}-`;
  let max = 0;
  for (const t of existing) {
    if (t.tokenSerial.startsWith(prefix)) {
      const n = parseInt(t.tokenSerial.slice(prefix.length), 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

/**
 * Tokeniza un activo IA: hashea contenido, prompt y metadata;
 * genera serial, fingerprint y features.
 */
export async function tokenizeAsset(
  input: TokenizeInput,
  existing: AssetToken[],
): Promise<AssetToken> {
  const now = new Date().toISOString();
  const serial = nextSerial(existing);
  const content = canonicalizeContent(input.content);
  const contentHash = await sha256Hex(content);
  const promptHash = input.prompt.trim()
    ? await sha256Hex(canonicalizeContent(input.prompt))
    : '';
  const meta = {
    title: input.title.trim(),
    kind: input.kind,
    modelId: input.modelId.trim() || 'unknown',
    steward: input.steward.trim() || 'anonymous',
    licenseIntent: input.licenseIntent,
    tags: [...input.tags].sort(),
    language: input.language || 'und',
    contentHash,
    promptHash,
    schema: 'FIST278.token.v1',
  };
  const metadataHash = await sha256Hex(buildMetadataEnvelope(meta));
  const commitment = await commitmentHash(contentHash, metadataHash, serial);
  const features = extractFeatures(content, input.kind);

  const token: AssetToken = {
    id: uid('tok'),
    tokenSerial: serial,
    status: 'tokenized',
    asset: {
      title: input.title.trim() || 'Activo sin título',
      kind: input.kind,
      content,
      description: input.description.trim(),
      modelId: input.modelId.trim() || 'unknown',
      prompt: input.prompt,
      steward: input.steward.trim() || 'anonymous',
      licenseIntent: input.licenseIntent,
      tags: input.tags,
      language: input.language || 'es',
    },
    contentHash,
    promptHash,
    metadataHash,
    commitmentHash: commitment,
    fingerprint: fingerprintFromHash(commitment, 12),
    features,
    validationHistory: [],
    linkedProjectId: input.linkedProjectId,
    standardId: 'FIST278',
    createdAt: now,
    updatedAt: now,
    tokenizedAt: now,
  };
  return token;
}

/** Re-computa hashes y verifica integridad del token almacenado */
export async function verifyTokenIntegrity(token: AssetToken): Promise<{
  contentOk: boolean;
  metadataOk: boolean;
  commitmentOk: boolean;
  recomputed: { contentHash: string; metadataHash: string; commitmentHash: string };
}> {
  const content = canonicalizeContent(token.asset.content);
  const contentHash = await sha256Hex(content);
  const promptHash = token.asset.prompt.trim()
    ? await sha256Hex(canonicalizeContent(token.asset.prompt))
    : '';
  const meta = {
    title: token.asset.title.trim(),
    kind: token.asset.kind,
    modelId: token.asset.modelId.trim() || 'unknown',
    steward: token.asset.steward.trim() || 'anonymous',
    licenseIntent: token.asset.licenseIntent,
    tags: [...token.asset.tags].sort(),
    language: token.asset.language || 'und',
    contentHash,
    promptHash,
    schema: 'FIST278.token.v1',
  };
  const metadataHash = await sha256Hex(buildMetadataEnvelope(meta));
  const commitment = await commitmentHash(contentHash, metadataHash, token.tokenSerial);
  return {
    contentOk: contentHash === token.contentHash,
    metadataOk: metadataHash === token.metadataHash,
    commitmentOk: commitment === token.commitmentHash,
    recomputed: { contentHash, metadataHash, commitmentHash: commitment },
  };
}

/** Sella el token con compromiso PQC-ready (hash + algoritmo declarado) */
export async function sealToken(
  token: AssetToken,
  algorithm = 'ML-DSA-65+SHA3-256',
): Promise<AssetToken> {
  const sealedAt = new Date().toISOString();
  const seal = await sealHash(token.commitmentHash, algorithm, sealedAt);
  return {
    ...token,
    status: 'sealed' as TokenStatus,
    pqcSeal: { algorithm, sealedAt, sealHash: seal },
    updatedAt: sealedAt,
  };
}

export function tokenExportEnvelope(token: AssetToken): string {
  const { asset, ...rest } = token;
  return JSON.stringify(
    {
      ...rest,
      asset: {
        ...asset,
        // Export includes content for portability; hash verifies integrity
      },
      exportSchema: 'FIST278.token.export.v1',
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}
