import { useMemo, useState } from 'react';
import type { ClaimNode, Project } from '../types';
import { analyzeProject, formatNum, formatPct } from '../math/engine';
import { BarChart, Formula, Gauge, LineChart, RadarChart } from './MathCharts';
import { uid } from '../store/storage';

export function ProjectMathPanel({
  project,
  onChange,
}: {
  project: Project;
  onChange: (p: Project) => void;
}) {
  const report = useMemo(() => analyzeProject(project), [project]);
  const [shareText, setShareText] = useState(
    (project.landscapeShares ?? []).join(', ') || '3, 2, 2, 1.5, 1',
  );

  const pathSeries = [
    report.readinessPath.map((p) => p.trl),
    report.readinessPath.map((p) => p.iprl),
    report.readinessPath.map((p) => p.pqrl),
  ];

  function updateEconomics(partial: Partial<NonNullable<Project['economics']>>) {
    onChange({
      ...project,
      economics: {
        assetValue: project.economics?.assetValue ?? 2_500_000,
        dataLifetimeYears: project.economics?.dataLifetimeYears ?? 15,
        migrationBudget: project.economics?.migrationBudget ?? 400_000,
        ...partial,
      },
    });
  }

  function applyShares() {
    const shares = shareText
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0);
    onChange({ ...project, landscapeShares: shares });
  }

  function updateClaim(id: string, patch: Partial<ClaimNode>) {
    const claimNodes = (project.claimNodes ?? []).map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    );
    onChange({ ...project, claimNodes });
  }

  function addClaim() {
    const roots = (project.claimNodes ?? []).filter((c) => !c.parentId);
    const parentId = roots[0]?.id;
    const node: ClaimNode = {
      id: uid('claim'),
      label: 'Nueva reivindicación',
      kind: 'dependent',
      breadth: 0.5,
      specificity: 0.6,
      parentId,
    };
    onChange({ ...project, claimNodes: [...(project.claimNodes ?? []), node] });
  }

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div className="grid grid-4">
        <div className="card" style={{ textAlign: 'center' }}>
          <Gauge value={report.rii} label="RII" />
          <span className="badge success">Grade {report.grade}</span>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Gauge value={report.compositeScore} label="Composite Φ" />
          <p className="muted" style={{ fontSize: '0.75rem', margin: 0 }}>
            media geom. RII·sec·(1−R)·struct
          </p>
        </div>
        <div className="card">
          <div className="stat-label">S_eff (bits)</div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>
            {report.stackSecurity.effectiveBits}
          </div>
          <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
            clásico {report.stackSecurity.classicalBits} · PQC {report.stackSecurity.pqcBits}
          </p>
        </div>
        <div className="card">
          <div className="stat-label">VaR₉₅ HNDL</div>
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>
            {formatNum(report.hndlMc.var95)}
          </div>
          <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
            E[L]={formatNum(report.hndlMc.expectedLossMean)} · P=
            {formatPct(report.hndlMc.pBreachMean)}
          </p>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <h3>Radar RII (AHP)</h3>
          <Formula>{`RII = 100 Σ w_i s_i   |   CR=${report.ahpCR.toFixed(4)} ${report.ahpConsistent ? '✓' : '⚠'}`}</Formula>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <RadarChart
              axes={report.riiBreakdown.map((w) => w.id.slice(0, 4))}
              values={report.riiBreakdown.map((w) => w.score)}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              {report.riiBreakdown.map((w) => (
                <div key={w.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>{w.name}</span>
                    <span className="mono">
                      {(w.score * 100).toFixed(0)}% · w={w.weight.toFixed(2)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: `${w.score * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Dinámica de madurez r(t)</h3>
          <Formula>{`r_{k+1} = r_k + η (W r + u − γ r)`}</Formula>
          <LineChart series={pathSeries} labels={['TRL', 'IPRL', 'PQRL']} height={130} />
          <div className="grid grid-3" style={{ marginTop: 10 }}>
            <div>
              <div className="stat-label">Esfuerzo tech*</div>
              <strong className="mono">{formatPct(report.effort.tech)}</strong>
            </div>
            <div>
              <div className="stat-label">Esfuerzo IP*</div>
              <strong className="mono">{formatPct(report.effort.ip)}</strong>
            </div>
            <div>
              <div className="stat-label">Esfuerzo PQC*</div>
              <strong className="mono">{formatPct(report.effort.pqc)}</strong>
            </div>
          </div>
          <p className="muted" style={{ fontSize: '0.8rem', marginBottom: 0 }}>
            Acoplamiento IP–PQC cosθ = <strong>{report.coupling.toFixed(3)}</strong> · Agility U=
            <strong>{report.agility.toFixed(1)}</strong>
          </p>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <h3>Markov del pipeline · π₈</h3>
          <Formula>{`P_{i,i}=1−c_i ,  P_{i,i+1}=c_i`}</Formula>
          <BarChart
            values={report.markov.dist8.map((x) => x * 100)}
            labels={report.markov.dist8.map((_, i) => `S${i}`)}
            height={120}
          />
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            P(≥S6 en 12 sprints) = <strong>{formatPct(report.markov.pReachS6)}</strong> · P(≥S9 en
            20) = <strong>{formatPct(report.markov.pReachS9)}</strong>
          </p>
        </div>

        <div className="card">
          <h3>Economía & c* óptimo</h3>
          <div className="form-group">
            <label>Valor del activo V</label>
            <input
              type="number"
              value={project.economics?.assetValue ?? 2500000}
              onChange={(e) => updateEconomics({ assetValue: Number(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>Vida útil confidencialidad L (años)</label>
            <input
              type="number"
              value={project.economics?.dataLifetimeYears ?? 15}
              onChange={(e) => updateEconomics({ dataLifetimeYears: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-2">
            <div>
              <div className="stat-label">c* cobertura</div>
              <strong className="mono">{report.optimalPqcCoverage.coverage.toFixed(2)}</strong>
            </div>
            <div>
              <div className="stat-label">Utilidad neta</div>
              <strong className="mono">{formatNum(report.optimalPqcCoverage.netUtility)}</strong>
            </div>
            <div>
              <div className="stat-label">E[V] a 5 años</div>
              <strong className="mono">{formatNum(report.valueProjection.expectedValue)}</strong>
            </div>
            <div>
              <div className="stat-label">Urgencia HNDL</div>
              <strong className="mono">{report.hndl.urgencyScore.toFixed(1)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <h3>Landscape · entropía / HHI</h3>
          <div className="form-group">
            <label>Cuotas de prior art</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="mono"
                style={{ flex: 1 }}
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={applyShares}>
                Aplicar
              </button>
            </div>
          </div>
          <div className="grid grid-3">
            <div>
              <div className="stat-label">Ĥ</div>
              <strong className="mono">{report.landscape.normalizedEntropy.toFixed(3)}</strong>
            </div>
            <div>
              <div className="stat-label">HHI</div>
              <strong className="mono">{report.landscape.hhi.toFixed(3)}</strong>
            </div>
            <div>
              <div className="stat-label">Novedad ν</div>
              <strong className="mono">{report.landscape.novelty.toFixed(3)}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Grafo de claims</h3>
          <div className="grid grid-3">
            <div>
              <div className="stat-label">Nodos</div>
              <strong className="mono">{report.claims.n}</strong>
            </div>
            <div>
              <div className="stat-label">Prof. máx</div>
              <strong className="mono">{report.claims.maxDepth}</strong>
            </div>
            <div>
              <div className="stat-label">Branching</div>
              <strong className="mono">{report.claims.avgBranching.toFixed(2)}</strong>
            </div>
            <div>
              <div className="stat-label">Defendibilidad</div>
              <strong className="mono">{report.claims.defensibility.toFixed(3)}</strong>
            </div>
            <div>
              <div className="stat-label">ρ(A) espectral</div>
              <strong className="mono">{report.claims.adjacencySpectralRadius.toFixed(3)}</strong>
            </div>
            <div>
              <div className="stat-label">Struct score</div>
              <strong className="mono">{report.claims.structuralScore.toFixed(3)}</strong>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addClaim}>
            + Claim
          </button>
          <div style={{ marginTop: 10, maxHeight: 220, overflow: 'auto' }}>
            {(project.claimNodes ?? []).map((c) => (
              <div
                key={c.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 6,
                  fontSize: '0.82rem',
                }}
              >
                <input
                  value={c.label}
                  onChange={(e) => updateClaim(c.id, { label: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select
                    value={c.kind}
                    onChange={(e) =>
                      updateClaim(c.id, { kind: e.target.value as ClaimNode['kind'] })
                    }
                  >
                    <option value="independent">independent</option>
                    <option value="dependent">dependent</option>
                    <option value="method">method</option>
                    <option value="system">system</option>
                    <option value="crm">crm</option>
                  </select>
                  <label className="muted">
                    breadth
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={c.breadth}
                      onChange={(e) => updateClaim(c.id, { breadth: Number(e.target.value) })}
                    />
                  </label>
                  <label className="muted">
                    specificity
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={c.specificity}
                      onChange={(e) => updateClaim(c.id, { specificity: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {report.handshake && (
        <div className="card">
          <h3>Overhead de handshake híbrido</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            ≈ <strong>{report.handshake.totalBytes}</strong> bytes totales · factor ×
            {report.handshake.relativeToX25519Ecdsa.toFixed(2)} respecto a baseline clásico · KEM{' '}
            {report.handshake.kemBytes} B · SIG {report.handshake.sigBytes} B
          </p>
        </div>
      )}
    </div>
  );
}
