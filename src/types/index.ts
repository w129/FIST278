/** FIST278 — tipos del sistema de desarrollo estructurado IP + Post-Cuántico */

export type Domain =
  | 'crypto'
  | 'quantum-sensing'
  | 'quantum-computing'
  | 'pqc-migration'
  | 'hybrid-systems'
  | 'materials'
  | 'ai-quantum'
  | 'other';

export type ProjectStatus = 'ideation' | 'active' | 'validation' | 'protection' | 'commercial' | 'archived';

export type StageId =
  | 's0_spark'
  | 's1_problem'
  | 's2_prior_art'
  | 's3_claim_tree'
  | 's4_feasibility'
  | 's5_prototype'
  | 's6_pqc_hardening'
  | 's7_ip_package'
  | 's8_validation'
  | 's9_scale';

export type StageStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'blocked';

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  notes?: string;
};

export type StageProgress = {
  stageId: StageId;
  status: StageStatus;
  checklist: ChecklistItem[];
  notes: string;
  score: number; // 0-100
  updatedAt: string;
};

export type ThreatModel = {
  harvestNowDecryptLater: boolean;
  classicalCryptoExposed: string[];
  migrationHorizon: '2026' | '2027-2028' | '2029-2030' | '2030+';
  hybridRequired: boolean;
  notes: string;
};

export type PQCStack = {
  kem: string; // e.g. ML-KEM-768
  signature: string; // e.g. ML-DSA-65
  hash: string;
  hybridMode: boolean;
  notes: string;
};

export type IPAsset = {
  id: string;
  title: string;
  kind: 'invention' | 'trade-secret' | 'software' | 'protocol' | 'dataset' | 'design';
  noveltyClaim: string;
  inventorship: string;
  jurisdiction: string;
  status: 'draft' | 'filed' | 'pending' | 'granted' | 'abandoned';
};

/** Nodo del grafo estructural de reivindicaciones (claim tree) */
export type ClaimNode = {
  id: string;
  label: string;
  kind: 'independent' | 'dependent' | 'method' | 'system' | 'crm';
  breadth: number;
  specificity: number;
  parentId?: string;
};

export type ProjectEconomics = {
  assetValue: number;
  dataLifetimeYears: number;
  migrationBudget: number;
};

export type RiiOverrideKey =
  | 'novelty'
  | 'defensibility'
  | 'feasibility'
  | 'market'
  | 'pqc'
  | 'timing'
  | 'evidence';

export type Project = {
  id: string;
  name: string;
  codename: string;
  vision: string;
  problem: string;
  domain: Domain;
  status: ProjectStatus;
  trl: number;
  iprl: number;
  pqrl: number;
  stages: StageProgress[];
  threatModel: ThreatModel;
  pqcStack: PQCStack;
  ipAssets: IPAsset[];
  tags: string[];
  /** Cuotas de landscape prior-art para entropía / HHI */
  landscapeShares?: number[];
  /** Árbol de claims para métricas espectrales y defendibilidad */
  claimNodes?: ClaimNode[];
  economics?: ProjectEconomics;
  /** Overrides manuales 0..1 sobre scores RII */
  riiOverrides?: Partial<Record<RiiOverrideKey, number>>;
  createdAt: string;
  updatedAt: string;
};

export type StageDefinition = {
  id: StageId;
  order: number;
  name: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  defaultChecklist: { id: string; label: string }[];
  gates: string[];
  icon: string;
};

export type PQCAlgorithm = {
  id: string;
  name: string;
  family: string;
  nistStatus: string;
  role: 'KEM' | 'Signature' | 'Hash' | 'Symmetric' | 'Other';
  securityLevel: string;
  sizeNotes: string;
  useCases: string[];
  migrationTips: string[];
};
