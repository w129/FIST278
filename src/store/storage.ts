import type {
  ChecklistItem,
  Project,
  StageId,
  StageProgress,
  IPAsset,
  Domain,
  ProjectStatus,
} from '../types';
import { STAGES } from '../data/methodology';

const STORAGE_KEY = 'FIST278.v2.projects';

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function createEmptyStages(): StageProgress[] {
  return STAGES.map((s, idx) => ({
    stageId: s.id,
    status: idx === 0 ? 'available' : 'locked',
    checklist: s.defaultChecklist.map(
      (c): ChecklistItem => ({ id: c.id, label: c.label, done: false }),
    ),
    notes: '',
    score: 0,
    updatedAt: new Date().toISOString(),
  }));
}

export function createProject(input: {
  name: string;
  codename: string;
  vision: string;
  problem: string;
  domain: Domain;
  tags?: string[];
}): Project {
  const now = new Date().toISOString();
  return {
    id: uid('proj'),
    name: input.name,
    codename: input.codename || 'NOVA',
    vision: input.vision,
    problem: input.problem,
    domain: input.domain,
    status: 'ideation',
    trl: 1,
    iprl: 1,
    pqrl: 1,
    stages: createEmptyStages(),
    threatModel: {
      harvestNowDecryptLater: true,
      classicalCryptoExposed: [],
      migrationHorizon: '2027-2028',
      hybridRequired: true,
      notes: '',
    },
    pqcStack: {
      kem: 'ML-KEM-768',
      signature: 'ML-DSA-65',
      hash: 'SHA3-256',
      hybridMode: true,
      notes: '',
    },
    ipAssets: [],
    tags: input.tags ?? [],
    landscapeShares: [3, 2.5, 2, 1.5, 1, 0.8, 0.5],
    claimNodes: [
      {
        id: 'c_ind_1',
        label: 'Claim independiente principal',
        kind: 'independent',
        breadth: 0.7,
        specificity: 0.35,
      },
      {
        id: 'c_dep_1',
        label: 'Embodiment preferido',
        kind: 'dependent',
        breadth: 0.45,
        specificity: 0.7,
        parentId: 'c_ind_1',
      },
      {
        id: 'c_m_1',
        label: 'Método de operación',
        kind: 'method',
        breadth: 0.5,
        specificity: 0.65,
        parentId: 'c_ind_1',
      },
      {
        id: 'c_sys_1',
        label: 'Sistema / aparato',
        kind: 'system',
        breadth: 0.55,
        specificity: 0.6,
        parentId: 'c_ind_1',
      },
    ],
    economics: {
      assetValue: 2_500_000,
      dataLifetimeYears: 15,
      migrationBudget: 400_000,
    },
    riiOverrides: {},
    createdAt: now,
    updatedAt: now,
  };
}

function migrateProject(p: Project): Project {
  return {
    ...p,
    landscapeShares: p.landscapeShares?.length ? p.landscapeShares : [3, 2, 2, 1.5, 1, 0.8],
    claimNodes: p.claimNodes?.length
      ? p.claimNodes
      : [
          {
            id: 'c_ind_1',
            label: 'Claim independiente principal',
            kind: 'independent',
            breadth: 0.65,
            specificity: 0.4,
          },
          {
            id: 'c_dep_1',
            label: 'Dependent claim',
            kind: 'dependent',
            breadth: 0.4,
            specificity: 0.7,
            parentId: 'c_ind_1',
          },
        ],
    economics: p.economics ?? {
      assetValue: 2_500_000,
      dataLifetimeYears: 15,
      migrationBudget: 400_000,
    },
    riiOverrides: p.riiOverrides ?? {},
  };
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDemoProjects();
    const parsed = JSON.parse(raw) as Project[];
    if (!Array.isArray(parsed)) return seedDemoProjects();
    return parsed.map(migrateProject);
  } catch {
    return seedDemoProjects();
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function upsertProject(projects: Project[], project: Project): Project[] {
  const next = projects.some((p) => p.id === project.id)
    ? projects.map((p) => (p.id === project.id ? { ...project, updatedAt: new Date().toISOString() } : p))
    : [...projects, { ...project, updatedAt: new Date().toISOString() }];
  saveProjects(next);
  return next;
}

export function deleteProject(projects: Project[], id: string): Project[] {
  const next = projects.filter((p) => p.id !== id);
  saveProjects(next);
  return next;
}

export function computeStageScore(stage: StageProgress): number {
  if (!stage.checklist.length) return stage.status === 'completed' ? 100 : 0;
  const done = stage.checklist.filter((c) => c.done).length;
  return Math.round((done / stage.checklist.length) * 100);
}

export function recomputeReadiness(project: Project): Project {
  const completed = project.stages.filter((s) => s.status === 'completed').length;
  const progressRatio = completed / STAGES.length;

  // TRL approx from stage progression + prototype/validation
  let trl = 1 + Math.floor(progressRatio * 8);
  if (project.stages.find((s) => s.stageId === 's5_prototype')?.status === 'completed') {
    trl = Math.max(trl, 5);
  }
  if (project.stages.find((s) => s.stageId === 's8_validation')?.status === 'completed') {
    trl = Math.max(trl, 7);
  }

  let iprl = 1;
  if (project.stages.find((s) => s.stageId === 's0_spark')?.status === 'completed') iprl = Math.max(iprl, 2);
  if (project.stages.find((s) => s.stageId === 's2_prior_art')?.status === 'completed') iprl = Math.max(iprl, 3);
  if (project.stages.find((s) => s.stageId === 's3_claim_tree')?.status === 'completed') iprl = Math.max(iprl, 4);
  if (project.stages.find((s) => s.stageId === 's7_ip_package')?.status === 'completed') iprl = Math.max(iprl, 6);
  if (project.ipAssets.some((a) => a.status === 'filed' || a.status === 'pending')) iprl = Math.max(iprl, 7);
  if (project.ipAssets.some((a) => a.status === 'granted')) iprl = Math.max(iprl, 8);

  let pqrl = 1;
  if (project.threatModel.classicalCryptoExposed.length > 0) pqrl = Math.max(pqrl, 2);
  if (project.threatModel.notes || project.threatModel.harvestNowDecryptLater) pqrl = Math.max(pqrl, 3);
  if (project.pqcStack.kem && project.pqcStack.signature) pqrl = Math.max(pqrl, 4);
  if (project.stages.find((s) => s.stageId === 's6_pqc_hardening')?.status === 'in_progress') {
    pqrl = Math.max(pqrl, 5);
  }
  if (project.stages.find((s) => s.stageId === 's6_pqc_hardening')?.status === 'completed') {
    pqrl = Math.max(pqrl, project.pqcStack.hybridMode ? 7 : 6);
  }

  let status: ProjectStatus = project.status;
  if (completed <= 1) status = 'ideation';
  else if (completed < 7) status = 'active';
  else if (completed < 8) status = 'validation';
  else if (completed < 9) status = 'protection';
  else status = 'commercial';

  return {
    ...project,
    trl: Math.min(9, Math.max(1, trl)),
    iprl: Math.min(9, Math.max(1, iprl)),
    pqrl: Math.min(9, Math.max(1, pqrl)),
    status,
  };
}

export function toggleChecklistItem(
  project: Project,
  stageId: StageId,
  itemId: string,
): Project {
  const stages = project.stages.map((s) => {
    if (s.stageId !== stageId) return s;
    const checklist = s.checklist.map((c) =>
      c.id === itemId ? { ...c, done: !c.done } : c,
    );
    const score = computeStageScore({ ...s, checklist });
    let status = s.status;
    if (status === 'available' || status === 'in_progress') {
      status = score > 0 ? 'in_progress' : 'available';
    }
    if (score === 100) status = 'completed';
    return { ...s, checklist, score, status, updatedAt: new Date().toISOString() };
  });

  // Unlock next stage when current completed
  const ordered = STAGES.map((def) => stages.find((s) => s.stageId === def.id)!);
  for (let i = 0; i < ordered.length - 1; i++) {
    if (ordered[i].status === 'completed' && ordered[i + 1].status === 'locked') {
      ordered[i + 1] = { ...ordered[i + 1], status: 'available' };
    }
  }

  return recomputeReadiness({ ...project, stages: ordered });
}

export function setStageNotes(project: Project, stageId: StageId, notes: string): Project {
  const stages = project.stages.map((s) =>
    s.stageId === stageId ? { ...s, notes, updatedAt: new Date().toISOString() } : s,
  );
  return { ...project, stages };
}

export function completeStage(project: Project, stageId: StageId): Project {
  const stages = project.stages.map((s) => {
    if (s.stageId !== stageId) return s;
    const checklist = s.checklist.map((c) => ({ ...c, done: true }));
    return {
      ...s,
      checklist,
      score: 100,
      status: 'completed' as const,
      updatedAt: new Date().toISOString(),
    };
  });
  const ordered = STAGES.map((def) => stages.find((s) => s.stageId === def.id)!);
  for (let i = 0; i < ordered.length - 1; i++) {
    if (ordered[i].status === 'completed' && ordered[i + 1].status === 'locked') {
      ordered[i + 1] = { ...ordered[i + 1], status: 'available' };
    }
  }
  return recomputeReadiness({ ...project, stages: ordered });
}

export function addIPAsset(project: Project, asset: Omit<IPAsset, 'id'>): Project {
  const ipAssets = [...project.ipAssets, { ...asset, id: uid('ip') }];
  return recomputeReadiness({ ...project, ipAssets });
}

export function overallProgress(project: Project): number {
  const scores = project.stages.map((s) => s.score);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function seedDemoProjects(): Project[] {
  const demo = createProject({
    name: 'Canal híbrido PQC para enlaces de larga vida',
    codename: 'AEGIS-768',
    vision:
      'Protocolo de establecimiento de claves híbrido (clásico + ML-KEM) optimizado para tráfico de alta latencia y datos con confidencialidad >15 años.',
    problem:
      'Los enlaces actuales basados en ECDH quedan expuestos a Harvest-Now-Decrypt-Later; no hay un perfil de interoperabilidad industrial con crypto-agility real.',
    domain: 'pqc-migration',
    tags: ['PQC', 'TLS', 'híbrido', 'HNDL'],
  });

  // Advance demo a bit so UI is rich
  let p = demo;
  p = completeStage(p, 's0_spark');
  p = toggleChecklistItem(p, 's1_problem', 's1_c1');
  p = toggleChecklistItem(p, 's1_problem', 's1_c2');
  p = {
    ...p,
    threatModel: {
      harvestNowDecryptLater: true,
      classicalCryptoExposed: ['ECDHE', 'RSA-2048 certs', 'JWT RS256'],
      migrationHorizon: '2027-2028',
      hybridRequired: true,
      notes: 'Priorizar tunnels VPN y backups offsite con retención 20 años.',
    },
    pqcStack: {
      kem: 'Híbrido X25519+ML-KEM-768',
      signature: 'ML-DSA-65',
      hash: 'SHA3-256',
      hybridMode: true,
      notes: 'Dual signature en fase de transición de PKI.',
    },
    ipAssets: [
      {
        id: uid('ip'),
        title: 'Método de negociación de KEM híbrido con fallback graceful',
        kind: 'invention',
        noveltyClaim:
          'Negociación de suites PQC con medición de path-MTU y degradación controlada sin downgrade attacks.',
        inventorship: 'Equipo FIST278',
        jurisdiction: 'PCT / US / EP',
        status: 'draft',
      },
    ],
    landscapeShares: [5, 3.5, 2, 1.8, 1.2, 0.6, 0.4],
    economics: {
      assetValue: 8_000_000,
      dataLifetimeYears: 20,
      migrationBudget: 1_200_000,
    },
    claimNodes: [
      {
        id: 'c_ind_1',
        label: 'Método de handshake híbrido con path-MTU adaptativo',
        kind: 'independent',
        breadth: 0.78,
        specificity: 0.42,
      },
      {
        id: 'c_dep_1',
        label: 'Medición de MTU en capa de transporte',
        kind: 'dependent',
        breadth: 0.5,
        specificity: 0.72,
        parentId: 'c_ind_1',
      },
      {
        id: 'c_dep_2',
        label: 'Fallback sin downgrade a suites clásicas solas',
        kind: 'dependent',
        breadth: 0.48,
        specificity: 0.8,
        parentId: 'c_ind_1',
      },
      {
        id: 'c_m_1',
        label: 'Método de composición X25519+ML-KEM',
        kind: 'method',
        breadth: 0.55,
        specificity: 0.68,
        parentId: 'c_ind_1',
      },
      {
        id: 'c_sys_1',
        label: 'Sistema de terminación VPN crypto-agile',
        kind: 'system',
        breadth: 0.6,
        specificity: 0.58,
        parentId: 'c_ind_1',
      },
    ],
    trl: 3,
    iprl: 3,
    pqrl: 4,
    status: 'active',
  };
  p = recomputeReadiness(p);

  const projects = [p];
  saveProjects(projects);
  return projects;
}

export { uid };
