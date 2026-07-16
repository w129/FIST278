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
  | 'pqc_seal'
  | 'human_review';

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
  /** Sello PQC simulado / commitment post-quantum ready */
  pqcSeal?: {
    algorithm: string;
    sealedAt: string;
    sealHash: string;
  };
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
