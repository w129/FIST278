/**
 * Motor de validación multi-gate FIST278.
 * Gate crítico: Certificado hashcod (sin él no hay pass).
 */

import type {
  AssetToken,
  GateResult,
  ValidationGateId,
  ValidationReport,
} from '../types/token';
import { verifyTokenIntegrity } from './tokenize';
import { jaccardWordTrigrams } from './features';
import { verifyHashCodCertificate } from './hashcodCertificate';
import { FIST278_STANDARD, HASHCOD } from '../data/standard';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const GATE_META: Record<ValidationGateId, { name: string; weight: number }> = {
  integrity: { name: 'Integridad criptográfica', weight: 0.14 },
  structure: { name: 'Estructura del activo', weight: 0.1 },
  ai_disclosure: { name: 'Divulgación de IA', weight: 0.08 },
  originality: { name: 'Originalidad vs registro', weight: 0.12 },
  quality: { name: 'Calidad de contenido', weight: 0.1 },
  policy: { name: 'Política y licencia', weight: 0.06 },
  provenance: { name: 'Procedencia (modelo/steward)', weight: 0.08 },
  hashcod_certificate: {
    name: 'Certificado hashcod (FIST278)',
    weight: 0.2,
  },
  pqc_seal: { name: 'Preparación de sello PQC', weight: 0.05 },
  human_review: { name: 'Revisión humana', weight: 0.07 },
};

export type ValidateOptions = {
  humanApproved?: boolean;
  humanNotes?: string;
  minContentChars?: number;
  originalityThreshold?: number;
};

/**
 * Pipeline de validación FIST278.
 * Pass solo si: integridad + originalidad + Certificado hashcod válido + revisión humana.
 */
export async function validateToken(
  token: AssetToken,
  registry: AssetToken[],
  opts: ValidateOptions = {},
): Promise<ValidationReport> {
  const gates: GateResult[] = [];

  // 1. Integridad
  const integrity = await verifyTokenIntegrity(token);
  const integScore =
    (integrity.contentOk ? 40 : 0) +
    (integrity.metadataOk ? 30 : 0) +
    (integrity.commitmentOk ? 30 : 0);
  gates.push({
    gateId: 'integrity',
    name: GATE_META.integrity.name,
    passed: integScore === 100,
    score: integScore,
    weight: GATE_META.integrity.weight,
    details:
      integrity.contentOk && integrity.commitmentOk
        ? 'Hashes de contenido, metadata y commitment coinciden (FIST278-3).'
        : `Fallo integridad: content=${integrity.contentOk} meta=${integrity.metadataOk} commit=${integrity.commitmentOk}`,
    evidence: token.contentHash.slice(0, 16) + '…',
  });

  // 2. Estructura
  const f = token.features;
  const structScore = Math.round(
    100 *
      Math.min(
        1,
        0.35 * f.structuralScore +
          0.25 * Math.min(1, f.wordCount / 80) +
          0.2 * f.uniqueWordRatio +
          0.2 * Math.min(1, f.shannonEntropy / 4.5),
      ),
  );
  gates.push({
    gateId: 'structure',
    name: GATE_META.structure.name,
    passed: structScore >= 55 && f.charCount >= (opts.minContentChars ?? 40),
    score: structScore,
    weight: GATE_META.structure.weight,
    details: `${f.wordCount} palabras · entropía ${f.shannonEntropy.toFixed(2)} · struct ${f.structuralScore.toFixed(2)}`,
  });

  // 3. Divulgación IA
  const hasModel = Boolean(token.asset.modelId && token.asset.modelId !== 'unknown');
  const hasPrompt = token.promptHash.length > 0;
  const hasSteward = Boolean(token.asset.steward && token.asset.steward !== 'anonymous');
  const discScore = (hasModel ? 40 : 0) + (hasPrompt ? 35 : 10) + (hasSteward ? 25 : 0);
  gates.push({
    gateId: 'ai_disclosure',
    name: GATE_META.ai_disclosure.name,
    passed: discScore >= 65,
    score: discScore,
    weight: GATE_META.ai_disclosure.weight,
    details: `modelo=${hasModel} prompt_hash=${hasPrompt} steward=${hasSteward}`,
  });

  // 4. Originalidad
  let maxSim = 0;
  let nearest = '';
  for (const other of registry) {
    if (other.id === token.id) continue;
    if (other.contentHash === token.contentHash) {
      maxSim = 1;
      nearest = other.tokenSerial;
      break;
    }
    const sim = jaccardWordTrigrams(token.asset.content, other.asset.content);
    if (sim > maxSim) {
      maxSim = sim;
      nearest = other.tokenSerial;
    }
  }
  const thr = opts.originalityThreshold ?? 0.42;
  const origScore = Math.round(100 * Math.max(0, 1 - maxSim / Math.max(thr, 0.01) * 0.7));
  const adjOrig = Math.round(origScore * (1 - 0.35 * f.aiPhraseSignal));
  gates.push({
    gateId: 'originality',
    name: GATE_META.originality.name,
    passed: maxSim < thr && adjOrig >= 50,
    score: Math.max(0, Math.min(100, adjOrig)),
    weight: GATE_META.originality.weight,
    details:
      maxSim < 0.01
        ? 'Sin solapamiento significativo en el registro.'
        : `Similitud máx ${maxSim.toFixed(3)} con ${nearest || '—'} (umbral ${thr}).`,
  });

  // 5. Calidad
  const quality =
    0.3 * (1 - f.repetitionScore) +
    0.25 * Math.min(1, f.trigramEntropy / 10) +
    0.2 * f.uniqueWordRatio +
    0.15 * f.structuralScore +
    0.1 * (1 - f.aiPhraseSignal);
  const qualityScore = Math.round(100 * Math.max(0, Math.min(1, quality)));
  gates.push({
    gateId: 'quality',
    name: GATE_META.quality.name,
    passed: qualityScore >= 50,
    score: qualityScore,
    weight: GATE_META.quality.weight,
    details: `repetición=${f.repetitionScore.toFixed(2)} · AI-phrases=${f.aiPhraseSignal.toFixed(2)} · H3=${f.trigramEntropy.toFixed(2)}`,
  });

  // 6. Política
  const licenseOk = token.asset.licenseIntent !== 'undecided';
  const titleOk = token.asset.title.trim().length >= 4;
  const policyScore =
    (licenseOk ? 50 : 15) + (titleOk ? 30 : 0) + (token.asset.tags.length ? 20 : 5);
  gates.push({
    gateId: 'policy',
    name: GATE_META.policy.name,
    passed: policyScore >= 60,
    score: Math.min(100, policyScore),
    weight: GATE_META.policy.weight,
    details: `licencia=${token.asset.licenseIntent} · tags=${token.asset.tags.length}`,
  });

  // 7. Procedencia
  const provScore =
    (hasModel ? 35 : 0) +
    (hasSteward ? 35 : 0) +
    (token.tokenizedAt ? 15 : 0) +
    (token.asset.description.trim().length > 10 ? 15 : 0);
  gates.push({
    gateId: 'provenance',
    name: GATE_META.provenance.name,
    passed: provScore >= 55,
    score: provScore,
    weight: GATE_META.provenance.weight,
    details: `${token.asset.modelId} · ${token.asset.steward}`,
  });

  // 8. CERTIFICADO HASHCOD (crítico — FIST278-4)
  const certCheck = await verifyHashCodCertificate(token.hashcodCertificate, token);
  gates.push({
    gateId: 'hashcod_certificate',
    name: GATE_META.hashcod_certificate.name,
    passed: certCheck.valid,
    score: certCheck.score,
    weight: GATE_META.hashcod_certificate.weight,
    details: certCheck.reasons.join(' '),
    evidence: token.hashcodCertificate?.certSerial ?? 'SIN-CERTIFICADO',
  });

  // 9. PQC
  const sealed = Boolean(token.pqcSeal);
  const pqcScore = sealed
    ? 100
    : token.status === 'tokenized' || token.status === 'validating'
      ? 55
      : 40;
  gates.push({
    gateId: 'pqc_seal',
    name: GATE_META.pqc_seal.name,
    passed: pqcScore >= 50,
    score: pqcScore,
    weight: GATE_META.pqc_seal.weight,
    details: sealed
      ? `Sellado con ${token.pqcSeal!.algorithm}`
      : 'Sin sello PQC aún — se puede sellar tras pass certificado hashcod.',
  });

  // 10. Human review
  const human = opts.humanApproved === true;
  const humanScore = human ? 100 : opts.humanApproved === false ? 0 : 40;
  gates.push({
    gateId: 'human_review',
    name: GATE_META.human_review.name,
    passed: human,
    score: humanScore,
    weight: GATE_META.human_review.weight,
    details: human
      ? opts.humanNotes || 'Aprobado por revisor humano.'
      : 'Pendiente de aprobación humana (marca el checkbox al validar).',
  });

  const composite = Math.round(
    gates.reduce((s, g) => s + g.score * g.weight, 0) /
      gates.reduce((s, g) => s + g.weight, 0),
  );

  const criticalFail = gates
    .filter(
      (g) =>
        g.gateId === 'integrity' ||
        g.gateId === 'originality' ||
        g.gateId === 'hashcod_certificate',
    )
    .some((g) => !g.passed);

  const passCount = gates.filter((g) => g.passed).length;
  let decision: ValidationReport['decision'] = 'fail';

  // Pass SOLO con certificado hashcod + human + sin críticos fallidos
  if (!criticalFail && certCheck.valid && composite >= 75 && human) {
    decision = 'pass';
  } else if (!criticalFail && composite >= 55) {
    decision = 'conditional';
  } else {
    decision = 'fail';
  }

  // Si falta certificado, forzar fail aunque el resto esté bien
  if (!certCheck.valid) {
    decision = decision === 'pass' ? 'fail' : decision;
    if (decision === 'conditional' && composite >= 75) {
      // keep conditional but message will explain hashcod required for pass
    }
  }

  const summary =
    decision === 'pass'
      ? `Conformidad FIST278 alcanzada (${passCount}/${gates.length} gates). Certificado hashcod ${token.hashcodCertificate?.certSerial ?? ''} verificado por ${HASHCOD.org}. Listo para sello PQC.`
      : !certCheck.valid
        ? `Validación incompleta (${composite}/100). REQUIERE Certificado hashcod válido (estándar internacional FIST278 por ${HASHCOD.org}). Emite el certificado antes de revalidar.`
        : decision === 'conditional'
          ? `Validación condicional (${composite}/100). Completa revisión humana o corrige gates fallidos. Estándar: ${FIST278_STANDARD.id}.`
          : `Validación fallida (${composite}/100). Revisa integridad, originalidad, certificado hashcod o calidad.`;

  return {
    id: uid('val'),
    tokenId: token.id,
    ranAt: new Date().toISOString(),
    gates,
    compositeScore: composite,
    decision: !certCheck.valid && decision === 'pass' ? 'fail' : decision,
    summary,
    validatorNotes: opts.humanNotes ?? '',
  };
}

export function applyValidationToToken(
  token: AssetToken,
  report: ValidationReport,
): AssetToken {
  const now = new Date().toISOString();
  let status = token.status;
  if (report.decision === 'pass') {
    status = 'validated';
  } else if (report.decision === 'fail' && report.compositeScore < 40) {
    status = 'rejected';
  } else {
    status = 'validating';
  }
  return {
    ...token,
    status,
    latestValidation: report,
    validationHistory: [...token.validationHistory, report].slice(-20),
    updatedAt: now,
    validatedAt: report.decision === 'pass' ? now : token.validatedAt,
    standardId: 'FIST278',
  };
}
