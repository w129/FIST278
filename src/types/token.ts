/** Núcleo FIST278: tokenización y validación de activos generados por IA */

export type AiAssetKind =
  | 'text'
  | 'code'
  | 'design'
  | 'protocol'
  | 'dataset'
  | 'model-weights-desc'
  | 'multimedia-desc'
  | 'invention-disclosure'
  | 'other';

export type TokenStatus =
  | 'draft'
  | 'tokenized'
  | 'validating'
  | 'validated'
  | 'rejected'
  | 'sealed'
  | 'revoked';

export type ValidationGateId =
  | 'integrity'
  | 'structure'
  | 'ai_disclosure'
  | 'originality'
  | 'quality'
  | 'policy'
  | 'provenance'
  | 'hashcod_certificate'
  | 'pqc_seal'
  | 'human_review';

/** Certificado hashcod de Validación (HVC) — obligatorio para pass FIST278 */
export type HashCodCertificate = {
  id: string;
  /** Serial legible HVC-FIST278-YEAR-##### */
  certSerial: string;
  fingerprint: string;
  issuer: string;
  issuerId: string;
  standard: string;
  standardVersion: string;
  profileId: string;
  tokenSerial: string;
  tokenId: string;
  commitmentHash: string;
  contentHash: string;
  subject: string;
  issuedAt: string;
  expiresAt: string;
  /** Firma de autoridad hashcod (cadena SHA-256) */
  signature: string;
  status: 'valid' | 'expired' | 'revoked';
  issuedBy: string;
  mark: string;
  /**
   * Clave hashcod obligatoria para validar en la plataforma.
   * Formato exacto: > |||||------|---|-|-|-|||----||||…| <
   * Solo caracteres | y - entre los delimitadores > y <.
   */
  hashcodKey: string;
  /** Origen: subido por el usuario o emitido en plataforma */
  source: 'uploaded' | 'issued';
  /** Contenido crudo del archivo subido (opcional, recortado) */
  rawUpload?: string;
};

export type GateResult = {
  gateId: ValidationGateId;
  name: string;
  passed: boolean;
  score: number; // 0..100
  weight: number;
  details: string;
  evidence?: string;
};

export type ValidationReport = {
  id: string;
  tokenId: string;
  ranAt: string;
  gates: GateResult[];
  compositeScore: number; // 0..100
  decision: 'pass' | 'conditional' | 'fail';
  summary: string;
  validatorNotes: string;
};

/** Payload del activo IA antes/después de tokenizar */
export type AiGeneratedAsset = {
  title: string;
  kind: AiAssetKind;
  content: string;
  description: string;
  /** Modelo generador (ej. grok-4, gpt-4o, local-llm) */
  modelId: string;
  /** Prompt o instrucción de generación (opcional, se hashea) */
  prompt: string;
  /** Humano supervisor / inventor de registro */
  steward: string;
  licenseIntent: 'proprietary' | 'open' | 'dual' | 'undecided';
  tags: string[];
  language: string;
};

/** Token digital del activo (registro local + sello criptográfico) */
export type AssetToken = {
  id: string;
  /** Identificador legible tipo FST-2026-0001 */
  tokenSerial: string;
  status: TokenStatus;
  asset: AiGeneratedAsset;
  /** SHA-256 del contenido canónico */
  contentHash: string;
  /** SHA-256 del prompt (vacío si no hay prompt) */
  promptHash: string;
  /** SHA-256 del envelope metadata (sin content crudo opcionalmente) */
  metadataHash: string;
  /** Hash de compromiso: H(contentHash || metadataHash || serial) */
  commitmentHash: string;
  /** Fingerprint corto para UI */
  fingerprint: string;
  /** Vector de features para originalidad (n-gram / entropía) */
  features: TokenFeatures;
  validationHistory: ValidationReport[];
  latestValidation?: ValidationReport;
  linkedProjectId?: string;
  /**
   * Certificado hashcod (HVC). Obligatorio para conformidad FIST278 (pass).
   * Emitido únicamente por autoridad hashcod.
   */
  hashcodCertificate?: HashCodCertificate;
  /** Sello PQC simulado / commitment post-quantum ready */
  pqcSeal?: {
    algorithm: string;
    sealedAt: string;
    sealHash: string;
  };
  /** Marca de estándar internacional */
  standardId?: 'FIST278';
  createdAt: string;
  updatedAt: string;
  tokenizedAt?: string;
  validatedAt?: string;
};

export type TokenFeatures = {
  charCount: number;
  wordCount: number;
  lineCount: number;
  uniqueWordRatio: number;
  shannonEntropy: number; // bits/char approx
  trigramEntropy: number;
  repetitionScore: number; // 0..1 high = more repetitive (worse)
  codeSignal: number; // 0..1 likelihood of code
  aiPhraseSignal: number; // heuristic AI-template density
  structuralScore: number; // 0..1 well-formed asset
};

export type TokenizeInput = AiGeneratedAsset & {
  linkedProjectId?: string;
};

export type RegistryStats = {
  total: number;
  tokenized: number;
  validated: number;
  rejected: number;
  sealed: number;
  avgValidationScore: number;
  uniqueModels: number;
};
