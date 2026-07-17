import type { ClearanceLevel, OpsMode } from '../data/opsProtocol';
import { CLEARANCE_RANKS, modeAllowed } from '../data/opsProtocol';

const KEY = 'fist278.v1.ops';

export type OpsState = {
  clearance: ClearanceLevel;
  mode: OpsMode;
  sessionNonce: string;
  operatorAlias: string;
  latticeChannel: string;
  updatedAt: string;
};

function defaultState(): OpsState {
  return {
    clearance: 'C0-PUBLIC-OBSERVER',
    mode: 'Ω-SILENT',
    sessionNonce: Math.random().toString(36).slice(2, 12).toUpperCase(),
    operatorAlias: 'OP-UNBOUND',
    latticeChannel: 'CH-NULL',
    updatedAt: new Date().toISOString(),
  };
}

export function loadOps(): OpsState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...(JSON.parse(raw) as OpsState) };
  } catch {
    return defaultState();
  }
}

export function saveOps(state: OpsState): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
  );
}

/** Frases de elevación de clearance (manual de operador) */
export const CLEARANCE_PASSPHRASES: Record<ClearanceLevel, string> = {
  'C0-PUBLIC-OBSERVER': '',
  'C1-DOSSIER-SCRIBE': 'SCRIBE-100F-DELTA',
  'C2-TOKEN-FORGER': 'FORGE-PHI-COMMIT',
  'C3-HVC-BEARER': 'HVC-PIPE-DASH-PSI',
  'C4-LATTICE-VALIDATOR': 'LATTICE-LAMBDA-PASS',
  'C5-PQC-SEALER': 'SEAL-SIGMA-PQC',
  'C6-ROOT-OPERATOR': 'hashcod-ROOT-OMEGA-278',
};

export function elevateClearance(
  state: OpsState,
  target: ClearanceLevel,
  passphrase: string,
): { ok: boolean; state: OpsState; error?: string } {
  const expected = CLEARANCE_PASSPHRASES[target];
  if (target === 'C0-PUBLIC-OBSERVER') {
    const next = { ...state, clearance: target, mode: 'Ω-SILENT' as OpsMode };
    saveOps(next);
    return { ok: true, state: next };
  }
  if (passphrase.trim() !== expected) {
    return {
      ok: false,
      state,
      error: `F278-E08: frase de elevación inválida para ${target}`,
    };
  }
  const rank = CLEARANCE_RANKS.find((c) => c.id === target)?.rank ?? 0;
  let mode = state.mode;
  if (!modeAllowed(mode, target)) {
    mode = rank >= 1 ? 'Ω-DOSSIER' : 'Ω-SILENT';
  }
  const next = { ...state, clearance: target, mode };
  saveOps(next);
  return { ok: true, state: next };
}

export function setMode(
  state: OpsState,
  mode: OpsMode,
): { ok: boolean; state: OpsState; error?: string } {
  if (!modeAllowed(mode, state.clearance)) {
    return {
      ok: false,
      state,
      error: `F278-E08: clearance ${state.clearance} no autoriza ${mode}`,
    };
  }
  const next = { ...state, mode };
  saveOps(next);
  return { ok: true, state: next };
}
