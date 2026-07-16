/**
 * Certificados HashCod (HVC) para conformidad FIST278.
 * Sin certificado HashCod válido, la validación del estándar no puede aprobarse.
 */

import type { AssetToken, HashCodCertificate } from '../types/token';
import { sha256Hex } from './crypto';
import { FIST278_STANDARD, HASHCOD } from '../data/standard';

/** Material de autoridad raíz HashCod (simulado en cliente; en producción sería HSM/CA) */
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
}): string {
  const ordered = {
    alg: 'HASHCOD-SHA256-CHAIN',
    commitmentHash: input.commitmentHash,
    contentHash: input.contentHash,
    expiresAt: input.expiresAt,
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
 * Emite un Certificado HashCod de Validación (HVC) para un token.
 * Solo la autoridad HashCod (esta función de plataforma) puede generar firmas válidas.
 */
export async function issueHashCodCertificate(
  token: AssetToken,
  opts: {
    existingCerts?: HashCodCertificate[];
    subject?: string;
    validityDays?: number;
    issuedBy?: string;
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

  const payload = buildCertPayload({
    certSerial,
    tokenSerial: token.tokenSerial,
    commitmentHash: token.commitmentHash,
    contentHash: token.contentHash,
    subject,
    issuedAt,
    expiresAt,
    standardVersion: FIST278_STANDARD.version,
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
  };
}

export type CertVerification = {
  valid: boolean;
  score: number;
  reasons: string[];
  checks: {
    issuer: boolean;
    standard: boolean;
    signature: boolean;
    notExpired: boolean;
    notRevoked: boolean;
    commitmentMatch: boolean;
    serialMatch: boolean;
    contentMatch: boolean;
  };
};

/**
 * Verifica un Certificado HashCod contra el token (conformidad FIST278-4).
 */
export async function verifyHashCodCertificate(
  cert: HashCodCertificate | undefined | null,
  token: AssetToken,
): Promise<CertVerification> {
  const reasons: string[] = [];
  if (!cert) {
    return {
      valid: false,
      score: 0,
      reasons: [
        'Falta Certificado HashCod (HVC). La validación FIST278 requiere certificado emitido por HashCod.',
      ],
      checks: {
        issuer: false,
        standard: false,
        signature: false,
        notExpired: false,
        notRevoked: false,
        commitmentMatch: false,
        serialMatch: false,
        contentMatch: false,
      },
    };
  }

  const issuer = cert.issuer === HASHCOD.org || cert.issuerId === HASHCOD.rootAuthorityId;
  if (!issuer) reasons.push(`Emisor no autorizado: ${cert.issuer} (se exige HashCod).`);

  const standard = cert.standard === FIST278_STANDARD.id;
  if (!standard) reasons.push(`Estándar incorrecto: ${cert.standard} (se exige FIST278).`);

  const payload = buildCertPayload({
    certSerial: cert.certSerial,
    tokenSerial: cert.tokenSerial,
    commitmentHash: cert.commitmentHash,
    contentHash: cert.contentHash,
    subject: cert.subject,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    standardVersion: cert.standardVersion,
  });
  const expectedSig = await signHashCodPayload(payload);
  const signature = cert.signature === expectedSig;
  if (!signature) reasons.push('Firma HashCod inválida o certificado adulterado.');

  const now = Date.now();
  const exp = Date.parse(cert.expiresAt);
  const notExpired = Number.isFinite(exp) && exp > now && cert.status !== 'expired';
  if (!notExpired) reasons.push('Certificado HashCod expirado o no vigente.');

  const notRevoked = cert.status !== 'revoked';
  if (!notRevoked) reasons.push('Certificado HashCod revocado por la autoridad.');

  const commitmentMatch = cert.commitmentHash === token.commitmentHash;
  if (!commitmentMatch) reasons.push('commitmentHash del certificado no coincide con el token.');

  const serialMatch = cert.tokenSerial === token.tokenSerial;
  if (!serialMatch) reasons.push('Serial del token no coincide con el certificado.');

  const contentMatch = cert.contentHash === token.contentHash;
  if (!contentMatch) reasons.push('contentHash del certificado no coincide con el token.');

  const checks = {
    issuer,
    standard,
    signature,
    notExpired,
    notRevoked,
    commitmentMatch,
    serialMatch,
    contentMatch,
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const valid = Object.values(checks).every(Boolean);
  const score = Math.round((passed / total) * 100);

  if (valid) {
    reasons.push(
      `Certificado HashCod ${cert.certSerial} válido · FIST278 v${cert.standardVersion} · ${cert.mark}`,
    );
  }

  return { valid, score, reasons, checks };
}

export function isCertificateBlockingValidation(v: CertVerification): boolean {
  return !v.valid;
}

export function certificateExportJson(cert: HashCodCertificate): string {
  return JSON.stringify(
    {
      ...cert,
      exportSchema: 'hashcod.hvc.export.v1',
      standardFullName: FIST278_STANDARD.fullName,
      authority: HASHCOD.legalName,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}
