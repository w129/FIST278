import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Binary, Network, Waves } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { analyzePortfolio, analyzeProject, formatNum, formatPct } from '../math/engine';
import {
  crqcArrivalCdf,
  hndlMonteCarlo,
  hybridHandshakeOverhead,
  hybridSecurityBits,
  migrationCostCurve,
  optimalCoverage,
} from '../math/pqc';
import { ahpPriorities, buildPairwiseFromWeights, landscapeNovelty, revolutionaryIpIndex } from '../math/ip_scoring';
import { BarChart, Formula, Gauge, LineChart, RadarChart } from '../components/MathCharts';
import { simpson } from '../math/stats';

export function MathLab() {
  const { projects } = useProjects();
  const portfolio = useMemo(() => analyzePortfolio(projects), [projects]);
  const [dataLife, setDataLife] = useState(15);
  const [assetValue, setAssetValue] = useState(5_000_000);
  const [coverage, setCoverage] = useState(0.45);
  const [classicalBits, setClassicalBits] = useState(128);
  const [pqcBits, setPqcBits] = useState(192);
  const [rho, setRho] = useState(0.1);
  const [shares, setShares] = useState('4, 3, 2, 2, 1, 0.5, 0.3');

  const mc = useMemo(
    () =>
      hndlMonteCarlo({
        dataLifetimeYears: dataLife,
        assetValueMean: assetValue,
        pqcCoverage: coverage,
        n: 3000,
        seed: 11,
      }),
    [dataLife, assetValue, coverage],
  );

  const opt = useMemo(
    () => optimalCoverage({ assetValue, dataLifetimeYears: dataLife }),
    [assetValue, dataLife],
  );

  const hybrid = hybridSecurityBits(classicalBits, pqcBits, rho);
  const handshake = hybridHandshakeOverhead({ kem: 'ML-KEM-768', sig: 'ML-DSA-65' });

  const shareArr = shares
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const land = landscapeNovelty(shareArr.length ? shareArr : [1, 1, 1]);

  const crqcCurve = useMemo(() => {
    const ys: number[] = [];
    for (let t = 0; t <= 25; t++) ys.push(crqcArrivalCdf(t));
    return ys;
  }, []);

  const costCurve = useMemo(() => {
    const ys: number[] = [];
    for (let i = 0; i <= 20; i++) ys.push(migrationCostCurve(i / 20) / 1e6);
    return ys;
  }, []);

  const ahpDemo = useMemo(() => {
    const w = [0.22, 0.18, 0.14, 0.12, 0.14, 0.1, 0.1];
    return ahpPriorities(buildPairwiseFromWeights(w));
  }, []);

  // Integral de riesgo acumulado ∫ P_CRQC(t) dt en [0, L]
  const integratedRisk = useMemo(
    () => simpson((t) => crqcArrivalCdf(t), 0, dataLife, 200) / Math.max(1, dataLife),
    [dataLife],
  );

  const riiDemo = revolutionaryIpIndex({
    novelty: land.novelty,
    defensibility: 0.7,
    feasibility: 0.55,
    market: 0.6,
    pqc: hybrid / 256,
    timing: mc.urgencyMean / 100,
    evidence: 0.5,
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Motor matemático</p>
          <h2>Math Lab · Estructura formal R-IP/PQ</h2>
          <p className="subtitle">
            AHP, entropía de landscape, cadenas de Markov, Monte Carlo HNDL, composición híbrida de
            seguridad, dinámica de madurez y optimización de cobertura PQC.
          </p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="stat-label">RII portafolio (soft-max)</div>
          <div className="stat-value">{portfolio.portfolioRii.toFixed(1)}</div>
          <Calculator size={16} color="#000000" style={{ marginTop: 8 }} />
        </div>
        <div className="card">
          <div className="stat-label">Riesgo residual ponderado</div>
          <div className="stat-value">{formatPct(portfolio.portfolioRisk)}</div>
          <Waves size={16} color="#000000" style={{ marginTop: 8 }} />
        </div>
        <div className="card">
          <div className="stat-label">Diversificación H_norm</div>
          <div className="stat-value">{portfolio.diversification.toFixed(2)}</div>
          <Network size={16} color="#000000" style={{ marginTop: 8 }} />
        </div>
        <div className="card">
          <div className="stat-label">S_hybrid (bits)</div>
          <div className="stat-value">{hybrid.toFixed(0)}</div>
          <Binary size={16} color="#000000" style={{ marginTop: 8 }} />
        </div>
      </div>

      <div className="split" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <h3>Monte Carlo HNDL</h3>
          <Formula>
            {`E[L] = V · P(T_CRQC < L) · (1 − c)   |   VaR_95, N=3000`}
          </Formula>
          <div className="grid grid-3" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label>Vida útil datos L (años)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={dataLife}
                onChange={(e) => setDataLife(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Valor del activo V</label>
              <input
                type="number"
                min={1000}
                step={100000}
                value={assetValue}
                onChange={(e) => setAssetValue(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Cobertura PQC c ∈ [0,1]</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={coverage}
                onChange={(e) => setCoverage(Number(e.target.value))}
              />
              <span className="mono muted">{coverage.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-4" style={{ marginTop: 8 }}>
            <div>
              <div className="stat-label">E[pérdida]</div>
              <strong className="mono">{formatNum(mc.expectedLossMean)}</strong>
            </div>
            <div>
              <div className="stat-label">VaR 95%</div>
              <strong className="mono">{formatNum(mc.var95)}</strong>
            </div>
            <div>
              <div className="stat-label">P(breach)</div>
              <strong className="mono">{formatPct(mc.pBreachMean)}</strong>
            </div>
            <div>
              <div className="stat-label">Urgencia</div>
              <strong className="mono">{mc.urgencyMean.toFixed(1)}</strong>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0, fontSize: '0.85rem' }}>
            Cobertura óptima (max V·(1−R(c)) − Cost(c)): <strong>c* = {opt.coverage.toFixed(2)}</strong>{' '}
            · utilidad neta {formatNum(opt.netUtility)} · riesgo residual {formatPct(opt.residualRisk)}.
            Cost(c) = C₀ (e^{'{'}λc{'}'}−1)/(e^λ−1).
          </p>
        </div>

        <div className="card">
          <h3>Curvas estructurales</h3>
          <div className="stat-label">CDF llegada CRQC · P(T≤t)</div>
          <LineChart series={[crqcCurve]} labels={['P_CRQC(t)']} height={110} />
          <div className="stat-label" style={{ marginTop: 12 }}>
            Coste migración / 10⁶
          </div>
          <LineChart
            series={[costCurve]}
            colors={['#000000']}
            labels={['Cost(c)']}
            height={100}
          />
          <p className="muted" style={{ fontSize: '0.8rem', marginBottom: 0 }}>
            Riesgo integrado medio (Simpson) (1/L)∫₀ᴸ P(t)dt = <strong>{integratedRisk.toFixed(3)}</strong>
          </p>
        </div>
      </div>

      <div className="split" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <h3>Composición híbrida de seguridad</h3>
          <Formula>{`S_h = min(S_c, S_pq) − ρ · 0.15 · min(S_c, S_pq)`}</Formula>
          <div className="grid grid-3">
            <div className="form-group">
              <label>S_clásico (bits)</label>
              <input
                type="number"
                value={classicalBits}
                onChange={(e) => setClassicalBits(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>S_PQC (bits)</label>
              <input type="number" value={pqcBits} onChange={(e) => setPqcBits(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Correlación ρ</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={rho}
                onChange={(e) => setRho(Number(e.target.value))}
              />
              <span className="mono muted">{rho.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <Gauge value={hybrid} max={256} label="S_hybrid bits" />
            <div>
              <div className="stat-label">Handshake ML-KEM-768 + ML-DSA-65</div>
              <p className="muted" style={{ margin: '0.35rem 0' }}>
                Total ≈ <strong>{handshake.totalBytes}</strong> B · ×
                {handshake.relativeToX25519Ecdsa.toFixed(1)} vs X25519+ECDSA
              </p>
              <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
                KEM {handshake.kemBytes} B + SIG {handshake.sigBytes} B + framing
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Entropía de landscape & RII</h3>
          <Formula>{`Ĥ = H(p)/log₂ n    HHI = Σ p_i²    ν = 0.6 Ĥ + 0.4(1−HHĨ)`}</Formula>
          <div className="form-group">
            <label>Cuotas prior-art (comma-separated)</label>
            <input value={shares} onChange={(e) => setShares(e.target.value)} className="mono" />
          </div>
          <div className="grid grid-3">
            <div>
              <div className="stat-label">H (bits)</div>
              <strong className="mono">{land.entropy.toFixed(3)}</strong>
            </div>
            <div>
              <div className="stat-label">Ĥ</div>
              <strong className="mono">{land.normalizedEntropy.toFixed(3)}</strong>
            </div>
            <div>
              <div className="stat-label">Novedad ν</div>
              <strong className="mono">{land.novelty.toFixed(3)}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <RadarChart
              axes={['Nov', 'Def', 'Feas', 'Mkt', 'PQC', 'Time', 'Evid']}
              values={riiDemo.weighted.map((w) => w.score)}
              size={200}
            />
            <div>
              <div className="stat-label">RII demo</div>
              <div className="stat-value">{riiDemo.rii.toFixed(1)}</div>
              <span className="badge success">Grade {riiDemo.grade}</span>
              <p className="muted" style={{ fontSize: '0.8rem' }}>
                AHP CR = {ahpDemo.CR.toFixed(4)}{' '}
                {ahpDemo.consistent ? '(consistente)' : '(revisar juicios)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3>Portafolio · ranking softmax π_i ∝ exp(s_i / τ)</h3>
        {projects.length === 0 ? (
          <p className="muted">Crea proyectos para rankear el portafolio.</p>
        ) : (
          <>
            <BarChart
              values={portfolio.ranks.map((r) => r.weight * 100)}
              labels={portfolio.ranks.map((r) => r.codename.slice(0, 8))}
              height={130}
            />
            <table className="table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>RII</th>
                  <th>Composite</th>
                  <th>Peso π</th>
                  <th>Markov P(S6)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.ranks.map((r) => {
                  const rep = portfolio.reports.find((x) => x.projectId === r.id)!;
                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="codename">{r.codename}</span>
                        <div>{r.name}</div>
                      </td>
                      <td className="mono">
                        {r.rii.toFixed(1)} <span className="badge">{rep.grade}</span>
                      </td>
                      <td className="mono">{r.composite.toFixed(1)}</td>
                      <td className="mono">{formatPct(r.weight)}</td>
                      <td className="mono">{formatPct(rep.markov.pReachS6)}</td>
                      <td>
                        <Link to={`/projects/${r.id}`} className="btn btn-sm btn-ghost">
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="card">
        <h3>Stack formal implementado</h3>
        <div className="grid grid-2">
          <ul className="muted" style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.9rem' }}>
            <li>
              <strong>Álgebra lineal:</strong> potencia iterada, Gauss-pivote, expm Taylor, κ₂
            </li>
            <li>
              <strong>AHP Saaty:</strong> autovector principal, CI/CR
            </li>
            <li>
              <strong>Información:</strong> Shannon H, Ĥ, HHI, novedad ν
            </li>
            <li>
              <strong>Grafos de claims:</strong> profundidad, branching, radio espectral, L regularizada
            </li>
          </ul>
          <ul className="muted" style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.9rem' }}>
            <li>
              <strong>PQC:</strong> S_hybrid, overhead, HNDL MC, coste convexo, c*
            </li>
            <li>
              <strong>Dinámica:</strong> r∈[1,9]³ acoplado, Markov 10 etapas, esfuerzo óptimo
            </li>
            <li>
              <strong>Valor:</strong> V₀·(RII/100)·e^{'{'}−δt{'}'}·(1+g)^t con escenarios softmax
            </li>
            <li>
              <strong>Portafolio:</strong> π = softmax(s/τ), riesgo residual ponderado
            </li>
          </ul>
        </div>
        {projects[0] && (
          <p className="muted" style={{ marginBottom: 0, marginTop: 12, fontSize: '0.85rem' }}>
            Ejemplo en vivo ({projects[0].codename}): composite=
            {analyzeProject(projects[0]).compositeScore.toFixed(1)} · acoplamiento IP–PQC=
            {analyzeProject(projects[0]).coupling.toFixed(3)}
          </p>
        )}
      </div>
    </div>
  );
}
