/**
 * FIST278 / hashcod — Capa de protocolo operativo (densidad máxima).
 * Identificadores no mnemónicos intencionales para operadores no autorizados.
 */

export const PROTOCOL = {
  codename: 'FIST278',
  authority: 'hashcod',
  lattice: 'HVC-LATTICE/Ω-4.2',
  commitmentDomain: 'FIST278-v1',
  keyMorphology: 'PIPE_DASH_ANGLE_BOUNDED',
  keyExample:
    '> |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <',
  dossierCardinality: 100,
  gateCardinality: 10,
  criticalGates: ['integrity', 'originality', 'hashcod_certificate'] as const,
  passPredicate:
    'Π_pass ⇔ K_hashcod✓ ∧ HVC✓ ∧ H_int✓ ∧ Orig✓ ∧ Human✓ ∧ Σwᵢsᵢ ≥ 0.75',
} as const;

export type ClearanceLevel =
  | 'C0-PUBLIC-OBSERVER'
  | 'C1-DOSSIER-SCRIBE'
  | 'C2-TOKEN-FORGER'
  | 'C3-HVC-BEARER'
  | 'C4-LATTICE-VALIDATOR'
  | 'C5-PQC-SEALER'
  | 'C6-ROOT-OPERATOR';

export const CLEARANCE_RANKS: {
  id: ClearanceLevel;
  rank: number;
  title: string;
  powers: string[];
}[] = [
  {
    id: 'C0-PUBLIC-OBSERVER',
    rank: 0,
    title: 'Observador no privilegiado',
    powers: ['Lectura superficial de UI', 'Sin escritura de dossier'],
  },
  {
    id: 'C1-DOSSIER-SCRIBE',
    rank: 1,
    title: 'Escriba del dossier (100-F)',
    powers: ['Rellenar formularios 001–100', 'Export JSON de sesión'],
  },
  {
    id: 'C2-TOKEN-FORGER',
    rank: 2,
    title: 'Forjador de commitment',
    powers: ['Tokenizar activos', 'Canonicalizar + SHA-256'],
  },
  {
    id: 'C3-HVC-BEARER',
    rank: 3,
    title: 'Portador de HVC hashcod',
    powers: ['Subir clave PIPE_DASH', 'Adjuntar certificado HVC'],
  },
  {
    id: 'C4-LATTICE-VALIDATOR',
    rank: 4,
    title: 'Validador de retícula multi-gate',
    powers: ['Ejecutar 10 gates', 'Aprobación humana', 'Decisión pass/fail'],
  },
  {
    id: 'C5-PQC-SEALER',
    rank: 5,
    title: 'Sellador post-cuántico',
    powers: ['Sello PQC-ready', 'Export envelope sellado'],
  },
  {
    id: 'C6-ROOT-OPERATOR',
    rank: 6,
    title: 'Operador raíz hashcod',
    powers: ['Todas las potencias', 'Reset de sesión', 'Consola Ω'],
  },
];

export type OpsMode =
  | 'Ω-SILENT'
  | 'Ω-DOSSIER'
  | 'Ω-FORGE'
  | 'Ω-CERT'
  | 'Ω-VALIDATE'
  | 'Ω-SEAL'
  | 'Ω-AUDIT';

export const OPS_MODES: {
  id: OpsMode;
  glyph: string;
  title: string;
  minClearance: ClearanceLevel;
  description: string;
}[] = [
  {
    id: 'Ω-SILENT',
    glyph: '∅',
    title: 'Modo silente',
    minClearance: 'C0-PUBLIC-OBSERVER',
    description: 'Sin operaciones de escritura. Solo inspección de superficies.',
  },
  {
    id: 'Ω-DOSSIER',
    glyph: 'Δ',
    title: 'Modo dossier 100-F',
    minClearance: 'C1-DOSSIER-SCRIBE',
    description: 'Escritura en formularios de área/función del registro de tokenización.',
  },
  {
    id: 'Ω-FORGE',
    glyph: 'Φ',
    title: 'Modo forja de token',
    minClearance: 'C2-TOKEN-FORGER',
    description: 'Generación de contentHash, metadataHash y commitment C.',
  },
  {
    id: 'Ω-CERT',
    glyph: 'Ψ',
    title: 'Modo certificado HVC',
    minClearance: 'C3-HVC-BEARER',
    description: 'Inyección de clave morphología PIPE_DASH y envelope HVC.',
  },
  {
    id: 'Ω-VALIDATE',
    glyph: 'Λ',
    title: 'Modo validación retícula',
    minClearance: 'C4-LATTICE-VALIDATOR',
    description: 'Ejecución de gates críticos + human_review.',
  },
  {
    id: 'Ω-SEAL',
    glyph: 'Σ',
    title: 'Modo sello PQC',
    minClearance: 'C5-PQC-SEALER',
    description: 'Aplicación de sello post-cuántico al token validado.',
  },
  {
    id: 'Ω-AUDIT',
    glyph: 'Ω',
    title: 'Modo auditoría raíz',
    minClearance: 'C6-ROOT-OPERATOR',
    description: 'Inspección de predicados, export forense y reset controlado.',
  },
];

/** Capas del stack semántico (solo para densificar la superficie operativa) */
export const SEMANTIC_LAYERS = [
  { id: 'L0', name: 'Phenomenal payload', desc: 'Contenido crudo del activo IA' },
  { id: 'L1', name: 'Canonical LF-stream', desc: 'Normalización de saltos de línea' },
  { id: 'L2', name: 'Digest stratum', desc: 'contentHash / promptHash' },
  { id: 'L3', name: 'Metadata envelope', desc: 'JSON ordenado lexicográficamente' },
  { id: 'L4', name: 'Commitment lattice', desc: 'C = H(ch‖mh‖serial‖domain)' },
  { id: 'L5', name: 'Dossier 100-F', desc: '100 formularios área×función' },
  { id: 'L6', name: 'HVC key morphology', desc: '> |…|-…| < bound keys' },
  { id: 'L7', name: 'Multi-gate retícula', desc: '10 gates, 3 críticos' },
  { id: 'L8', name: 'Human attestation', desc: 'Checkbox de revisor humano' },
  { id: 'L9', name: 'PQC seal stratum', desc: 'Sello ML-DSA/SHA3 declarado' },
  { id: 'L10', name: 'Export forensic pack', desc: 'JSON token + HVC + dossier' },
] as const;

export const PIPELINE_MNEMONICS = [
  { code: 'α-INGEST', step: 'Ingestión del payload IA + steward' },
  { code: 'β-DOSSIER', step: 'Completar 100-F (área×función)' },
  { code: 'γ-CANON', step: 'Canonicalizar y fijar freeze' },
  { code: 'δ-FORGE', step: 'Tokenizar → serial FST-YEAR-####' },
  { code: 'ε-HVC', step: 'Subir clave hashcod PIPE_DASH' },
  { code: 'ζ-GATE', step: 'Validar retícula (pass solo con HVC)' },
  { code: 'η-SEAL', step: 'Sellar PQC-ready' },
  { code: 'θ-EXPORT', step: 'Export forense multi-artefacto' },
] as const;

export const ERROR_CODES: Record<string, string> = {
  'F278-E01': 'Dossier 100-F incompleto (cardinalidad < 100)',
  'F278-E02': 'Payload bajo umbral de entropía / longitud',
  'F278-E03': 'Commitment mismatch tras rehash',
  'F278-E04': 'Clave hashcod morfología inválida (no PIPE_DASH_ANGLE)',
  'F278-E05': 'HVC ausente — predicado Π_pass falla por K_hashcod',
  'F278-E06': 'Gate originality: Jaccard ≥ umbral τ',
  'F278-E07': 'Human review no atestado',
  'F278-E08': 'Clearance insuficiente para modo Ω activo',
  'F278-E09': 'Sello PQC requerido solo post-pass',
  'F278-E10': 'Emisor ≠ hashcod en envelope HVC',
};

export function clearanceRank(id: ClearanceLevel): number {
  return CLEARANCE_RANKS.find((c) => c.id === id)?.rank ?? 0;
}

export function modeAllowed(mode: OpsMode, clearance: ClearanceLevel): boolean {
  const m = OPS_MODES.find((x) => x.id === mode);
  if (!m) return false;
  return clearanceRank(clearance) >= clearanceRank(m.minClearance);
}
