/**
 * FIST278 — Estándar internacional hashcod
 * International Standard for AI-Generated Asset Tokenization & Validation
 */

export const HASHCOD = {
  org: 'hashcod',
  legalName: 'hashcod',
  shortName: 'hashcod',
  rootAuthorityId: 'hashcod-ROOT-ISA-001',
  websiteLabel: 'hashcod.standards',
  contactDomain: 'standards.hashcod',
} as const;

export const FIST278_STANDARD = {
  id: 'FIST278',
  fullName:
    'FIST278 — Framework for International Standardization of Tokenized AI Assets',
  shortName: 'FIST278',
  version: '1.0.0',
  status: 'Published' as const,
  publisher: HASHCOD.org,
  authority: HASHCOD.legalName,
  publishedAt: '2026-01-15',
  scope:
    'Tokenización, attestation criptográfica y validación certificada de activos generados por inteligencia artificial a escala internacional.',
  classification: 'International Standard (hashcod ISA)',
  domains: [
    'AI asset tokenization',
    'Cryptographic commitment (SHA-256)',
    'Multi-gate validation',
    'hashcod certificate authority',
    'Post-quantum readiness seals',
    'IP pipeline readiness (optional layer)',
  ],
  normativeRequirements: [
    'Todo activo IA sujeto a FIST278 DEBE tokenizarse con contentHash, metadataHash y commitmentHash.',
    'La validación conforme a FIST278 REQUIERE un Certificado hashcod vigente y verificable.',
    'El certificado hashcod DEBE subirse a la plataforma y PRESENTAR una clave en formato: > |||||------|---|-|-|-|||----||||…| < (solo | y - entre delimitadores).',
    'Sin clave hashcod en ese formato, el resultado de validación NO PUEDE ser pass (aprobado).',
    'El certificado DEBE vincular serial del token y commitmentHash del activo cuando se declare.',
    'El sello PQC-ready es RECOMENDADO tras pass certificado.',
    'La divulgación de modelo generador y steward humano es OBLIGATORIA.',
  ],
  certificateProfile: {
    name: 'hashcod Validation Certificate (HVC)',
    profileId: 'HVC-FIST278-1.0',
    issuer: HASHCOD.org,
    algorithm: 'HMAC-SHA256-sim / SHA-256 commitment chain',
    validityDefaultDays: 365,
  },
  clauses: [
    {
      id: 'FIST278-1',
      title: 'Objecto y campo de aplicación',
      body: 'Este estándar internacional especifica requisitos para la tokenización y validación de activos generados por IA bajo autoridad de certificación hashcod.',
    },
    {
      id: 'FIST278-2',
      title: 'Términos y definiciones',
      body: 'Token: representación canónica con hashes. Certificado hashcod: credencial emitida por hashcod que atestigua conformidad FIST278. Validación: evaluación multi-gate con gate obligatorio de certificado.',
    },
    {
      id: 'FIST278-3',
      title: 'Tokenización',
      body: 'El contenido se canonicaliza (LF). Se computan SHA-256 de contenido y metadata. Commitment C = SHA-256(contentHash ‖ metadataHash ‖ serial ‖ "FIST278-v1").',
    },
    {
      id: 'FIST278-4',
      title: 'Validación y certificado hashcod',
      body: 'La conformidad se alcanza solo si todos los gates críticos pasan y existe un Certificado hashcod válido sobre el token. hashcod es la única autoridad de emisión reconocida por este estándar.',
    },
    {
      id: 'FIST278-5',
      title: 'Marcado y trazabilidad',
      body: 'Los activos validados DEBEN mostrar marca "FIST278 · Certified by hashcod" y el identificador del certificado HVC.',
    },
  ],
} as const;

export const STANDARD_MARK = 'FIST278 · Certified by hashcod';
