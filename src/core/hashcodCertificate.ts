/**
 * Certificados HashCod (HVC) para conformidad FIST278.
 *
 * REGLA DE PLATAFORMA:
 * El certificado DEBE subirse (o emitirse) presentando una clave HashCod
 * en el formato:
 *   > |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <
 *
 * Sin clave válida en ese formato, la validación FIST278 no puede aprobarse.
 */

import type { AssetToken, HashCodCertificate } from '../types/token';
import { sha256Hex } from './crypto';
import { FIST278_STANDARD, HASHCOD } from '../data/standard';
import {
  deriveHashCodKey,
  HASHCOD_KEY_EXAMPLE,
  isValidHashCodKey,
  parseHashCodKey,
  parseUploadedCertificate,
} from './hashcodKey';

const HASHCOD_ROOT_MATERIAL = 'HASHCOD-ISA-ROOT::FIST278::v1::AUTHORITY';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function nextCertSerial(existing: HashCodCertificate[]): string {
  const year = new Date().getFullYear();
  const prefix = `HVC-FIST278-${year}-`;
  let max = 0;
  for (const c of existing) {
    if (c.certSerial.startsWith(prefix)) {
      const n = parseInt(c.certSerial.slice(prefix.length), 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(5, '0')}`;
}

export function buildCertPayload(input: {
  certSerial: string;
  tokenSerial: string;
  commitmentHash: string;
  contentHash: string;
  subject: string;
  issuedAt: string;
  expiresAt: string;
  standardVersion: string;
  hashcodKey: string;
}): string {
  const ordered = {
    alg: 'HASHCOD-SHA256-CHAIN',
    commitmentHash: input.commitmentHash,
    contentHash: input.contentHash,
    expiresAt: input.expiresAt,
    hashcodKey: input.hashcodKey,
    issuedAt: input.issuedAt,
    issuer: HASHCOD.org,
    issuerId: HASHCOD.rootAuthorityId,
    profile: FIST278_STANDARD.certificateProfile.profileId,
    standard: FIST278_STANDARD.id,
    standardVersion: input.standardVersion,
    subject: input.subject,
    certSerial: input.certSerial,
    tokenSerial: input.tokenSerial,
  };
  return JSON.stringify(ordered);
}

export async function signHashCodPayload(payload: string): Promise<string> {
  return sha256Hex(`${HASHCOD_ROOT_MATERIAL}|${payload}|HASHCOD-SIGN`);
}

/**
 * Emite HVC con clave HashCod en formato > |…|-…| <
 */
export async function issueHashCodCertificate(
  token: AssetToken,
  opts: {
    existingCerts?: HashCodCertificate[];
    subject?: string;
    validityDays?: number;
    issuedBy?: string;
    /** Si se omite, se deriva de los hashes del token */
    hashcodKey?: string;
  } = {},
): Promise<HashCodCertificate> {
  const now = new Date();
  const days = opts.validityDays ?? FIST278_STANDARD.certificateProfile.validityDefaultDays;
  const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const issuedAt = now.toISOString();
  const expiresAt = expires.toISOString();
  const certSerial = nextCertSerial(opts.existingCerts ?? []);
  const subject =
    opts.subject?.trim() ||
    `${token.asset.steward || 'subject'} · ${token.tokenSerial}`;

  let hashcodKey = opts.hashcodKey?.trim()
    ? opts.hashcodKey.trim()
    : deriveHashCodKey(token.commitmentHash, token.contentHash);

  const keyParse = parseHashCodKey(hashcodKey);
  if (!keyParse.ok) {
    throw new Error(keyParse.error || 'Clave HashCod inválida al emitir certificado');
  }
  hashcodKey = keyParse.key;

  const payload = buildCertPayload({
    certSerial,
    tokenSerial: token.tokenSerial,
    commitmentHash: token.commitmentHash,
    contentHash: token.contentHash,
    subject,
    issuedAt,
    expiresAt,
    standardVersion: FIST278_STANDARD.version,
    hashcodKey,
  });
  const signature = await signHashCodPayload(payload);
  const fingerprint = signature.slice(0, 16).toUpperCase();

  return {
    id: uid('hvc'),
    certSerial,
    fingerprint,
    issuer: HASHCOD.org,
    issuerId: HASHCOD.rootAuthorityId,
    standard: FIST278_STANDARD.id,
    standardVersion: FIST278_STANDARD.version,
    profileId: FIST278_STANDARD.certificateProfile.profileId,
    tokenSerial: token.tokenSerial,
    tokenId: token.id,
    commitmentHash: token.commitmentHash,
    contentHash: token.contentHash,
    subject,
    issuedAt,
    expiresAt,
    signature,
    status: 'valid',
    issuedBy: opts.issuedBy?.trim() || HASHCOD.legalName,
    mark: 'FIST278 · Certified by HashCod',
    hashcodKey,
    source: opts.hashcodKey ? 'uploaded' : 'issued',
  };
}

/**
 * Construye certificado a partir de subida (archivo/texto) + clave HashCod obligatoria.
 */
export async function certificateFromUpload(
  token: AssetToken,
  rawUpload: string,
  opts: {
    existingCerts?: HashCodCertificate[];
    subject?: string;
  } = {},
): Promise<HashCodCertificate> {
  const parsed = parseUploadedCertificate(rawUpload);
  if (!parsed.ok || !parsed.hashcodKey) {
    throw new Error(
      parsed.error ||
        `El certificado debe presentar una clave HashCod como:\n${HASHCOD_KEY_EXAMPLE}`,
    );
  }

  const keyParse = parseHashCodKey(parsed.hashcodKey);
  if (!keyParse.ok) {
    throw new Error(keyParse.error || 'Clave HashCod inválida');
  }

  const now = new Date();
  const issuedAt = parsed.meta.issuedAt || now.toISOString();
  const expiresAt =
    parsed.meta.expiresAt ||
    new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const certSerial =
    parsed.meta.certSerial || nextCertSerial(opts.existingCerts ?? []);
  const subject =
    opts.subject?.trim() ||
    parsed.meta.subject ||
    `${token.asset.steward || 'subject'} · ${token.tokenSerial}`;

  // Si el upload trae hashes, deben coincidir con el token (si existen)
  if (
    parsed.meta.commitmentHash &&
    parsed.meta.commitmentHash !== token.commitmentHash
  ) {
    throw new Error(
      'El commitmentHash del certificado subido no coincide con el token.',
    );
  }
  if (parsed.meta.contentHash && parsed.meta.contentHash !== token.contentHash) {
    throw new Error('El contentHash del certificado subido no coincide con el token.');
  }
  if (parsed.meta.tokenSerial && parsed.meta.tokenSerial !== token.tokenSerial) {
    throw new Error('El tokenSerial del certificado subido no coincide con este token.');
  }

  const hashcodKey = keyParse.key;
  const payload = buildCertPayload({
    certSerial,
    tokenSerial: token.tokenSerial,
    commitmentHash: token.commitmentHash,
    contentHash: token.contentHash,
    subject,
    issuedAt,
    expiresAt,
    standardVersion: FIST278_STANDARD.version,
    hashcodKey,
  });

  // Firma: si el archivo trae signature propia la guardamos; si no, firmamos cadena local
  // Para validación de plataforma el requisito crítico es la clave en formato correcto.
  let signature = parsed.meta.signature || '';
  if (!signature) {
    signature = await signHashCodPayload(payload);
  }

  return {
    id: uid('hvc'),
    certSerial,
    fingerprint: (signature || hashcodKey).slice(0, 16).toUpperCase().replace(/\s/g, ''),
    issuer: parsed.meta.issuer || HASHCOD.org,
    issuerId: HASHCOD.rootAuthorityId,
    standard: FIST278_STANDARD.id,
    standardVersion: FIST278_STANDARD.version,
    profileId: FIST278_STANDARD.certificateProfile.profileId,
    tokenSerial: token.tokenSerial,
    tokenId: token.id,
    commitmentHash: token.commitmentHash,
    contentHash: token.contentHash,
    subject,
    issuedAt,
    expiresAt,
    signature,
    status: 'valid',
    issuedBy: HASHCOD.legalName,
    mark: 'FIST278 · Certified by HashCod',
    hashcodKey,
    source: 'uploaded',
    rawUpload: rawUpload.slice(0, 8000),
  };
}

export type CertVerification = {
  valid: boolean;
  score: number;
  reasons: string[];
  checks: {
    hasCertificate: boolean;
    hashcodKeyFormat: boolean;
    issuer: boolean;
    standard: boolean;
    notExpired: boolean;
    notRevoked: boolean;
    commitmentMatch: boolean;
    serialMatch: boolean;
    contentMatch: boolean;
  };
};

/**
 * Verifica certificado + clave HashCod (formato > |…|-…| < es OBLIGATORIO).
 */
export async function verifyHashCodCertificate(
  cert: HashCodCertificate | undefined | null,
  token: AssetToken,
): Promise<CertVerification> {
  const reasons: string[] = [];
  const emptyChecks = {
    hasCertificate: false,
    hashcodKeyFormat: false,
    issuer: false,
    standard: false,
    notExpired: false,
    notRevoked: false,
    commitmentMatch: false,
    serialMatch: false,
    contentMatch: false,
  };

  if (!cert) {
    return {
      valid: false,
      score: 0,
      reasons: [
        'Falta Certificado HashCod. Debe subirse presentando clave en formato: > |||||------|---|…| <',
      ],
      checks: emptyChecks,
    };
  }

  const hasCertificate = true;

  // CRÍTICO: formato de clave HashCod
  const keyParse = parseHashCodKey(cert.hashcodKey);
  const hashcodKeyFormat = keyParse.ok;
  if (!hashcodKeyFormat) {
    reasons.push(
      keyParse.error ||
        `Clave HashCod ausente o inválida. Debe ser: ${HASHCOD_KEY_EXAMPLE}`,
    );
  }

  const issuer =
    cert.issuer === HASHCOD.org ||
    cert.issuerId === HASHCOD.rootAuthorityId ||
    cert.source === 'uploaded';
  if (!issuer) reasons.push(`Emisor no autorizado: ${cert.issuer}`);

  const standard = cert.standard === FIST278_STANDARD.id || !cert.standard;
  if (!standard) reasons.push(`Estándar incorrecto: ${cert.standard}`);

  const now = Date.now();
  const exp = Date.parse(cert.expiresAt);
  const notExpired =
    (!cert.expiresAt || (Number.isFinite(exp) && exp > now)) && cert.status !== 'expired';
  if (!notExpired) reasons.push('Certificado HashCod expirado o no vigente.');

  const notRevoked = cert.status !== 'revoked';
  if (!notRevoked) reasons.push('Certificado HashCod revocado.');

  const commitmentMatch =
    !cert.commitmentHash || cert.commitmentHash === token.commitmentHash;
  if (!commitmentMatch) reasons.push('commitmentHash no coincide con el token.');

  const serialMatch = !cert.tokenSerial || cert.tokenSerial === token.tokenSerial;
  if (!serialMatch) reasons.push('tokenSerial no coincide.');

  const contentMatch = !cert.contentHash || cert.contentHash === token.contentHash;
  if (!contentMatch) reasons.push('contentHash no coincide.');

  // Firma: si es emitida localmente, verificar; si es subida, la clave es el requisito de plataforma
  let signatureOk = true;
  if (cert.source === 'issued' && cert.hashcodKey) {
    try {
      const payload = buildCertPayload({
        certSerial: cert.certSerial,
        tokenSerial: cert.tokenSerial,
        commitmentHash: cert.commitmentHash,
        contentHash: cert.contentHash,
        subject: cert.subject,
        issuedAt: cert.issuedAt,
        expiresAt: cert.expiresAt,
        standardVersion: cert.standardVersion || FIST278_STANDARD.version,
        hashcodKey: cert.hashcodKey,
      });
      const expected = await signHashCodPayload(payload);
      signatureOk = cert.signature === expected;
      if (!signatureOk) reasons.push('Firma de certificado emitido no verifica.');
    } catch {
      signatureOk = false;
      reasons.push('No se pudo verificar la firma del certificado.');
    }
  }

  const checks = {
    hasCertificate,
    hashcodKeyFormat,
    issuer,
    standard,
    notExpired,
    notRevoked,
    commitmentMatch,
    serialMatch,
    contentMatch,
  };

  // Clave inválida → siempre fail (aunque el resto esté bien)
  const valid =
    hashcodKeyFormat &&
    hasCertificate &&
    issuer &&
    standard &&
    notExpired &&
    notRevoked &&
    commitmentMatch &&
    serialMatch &&
    contentMatch &&
    (cert.source === 'uploaded' || signatureOk);

  const checkVals = Object.values(checks);
  const score = Math.round(
    ((checkVals.filter(Boolean).length + (signatureOk || cert.source === 'uploaded' ? 1 : 0)) /
      (checkVals.length + 1)) *
      100,
  );

  if (valid) {
    reasons.push(
      `Clave HashCod válida · ${cert.certSerial || 'HVC'} · ${cert.hashcodKey.slice(0, 24)}…`,
    );
  } else if (!hashcodKeyFormat) {
    reasons.unshift(
      'La plataforma solo valida certificados HashCod cuya clave sea del tipo: > |||||------|---|-|-|-|||…| <',
    );
  }

  return { valid, score: Math.min(100, score), reasons, checks };
}

export function certificateExportJson(cert: HashCodCertificate): string {
  return JSON.stringify(
    {
      ...cert,
      exportSchema: 'hashcod.hvc.export.v1',
      standardFullName: FIST278_STANDARD.fullName,
      authority: HASHCOD.legalName,
      keyFormat:
        'Clave obligatoria: > |||||------|---|-|-|-|||----||||…| <  (solo | y - entre delimitadores)',
      keyExample: HASHCOD_KEY_EXAMPLE,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

export { HASHCOD_KEY_EXAMPLE, isValidHashCodKey, parseHashCodKey, parseUploadedCertificate };
