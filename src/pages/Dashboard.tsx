import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  ShieldCheck,
  Activity,
  FileLock2,
  ArrowRight,
  Calculator,
  GitBranch,
} from 'lucide-react';
import { useTokens } from '../context/TokenContext';
import { useProjects } from '../context/ProjectContext';
import { BarChart } from '../components/MathCharts';
import { HashcodIcon } from '../components/HashcodIcon';

export function Dashboard() {
  const { tokens, stats, loading } = useTokens();
  const { projects } = useProjects();

  const recent = tokens.slice(0, 5);
  const scoreSeries = useMemo(
    () =>
      tokens
        .filter((t) => t.latestValidation)
        .slice(0, 12)
        .map((t) => t.latestValidation!.compositeScore),
    [tokens],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <HashcodIcon size={36} variant="black" />
            <p className="kicker" style={{ margin: 0 }}>
              FIST278 · hashcod International Standard
            </p>
          </div>
          <h2>Tokenizar y validar activos generados por IA</h2>
          <p className="subtitle">
            Estándar internacional publicado por <strong>hashcod</strong>. Tokeniza outputs de IA
            (SHA-256 + commitment) y valídalos con pipeline multi-gate. La aprobación (
            <strong>pass</strong>) exige un <strong>Certificado hashcod (HVC)</strong> vigente.
          </p>
        </div>
        <Link to="/tokenize" className="btn btn-primary">
          <Coins size={18} /> Tokenizar activo
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="stat-label">Tokens en registro</div>
          <div className="stat-value">{stats.total}</div>
          <Activity size={18} style={{ color: 'var(--accent)', marginTop: 8 }} />
        </div>
        <div className="card">
          <div className="stat-label">Validados</div>
          <div className="stat-value">{stats.validated}</div>
          <ShieldCheck size={18} style={{ color: 'var(--accent-3)', marginTop: 8 }} />
        </div>
        <div className="card">
          <div className="stat-label">Sellados PQC</div>
          <div className="stat-value">{stats.sealed}</div>
          <FileLock2 size={18} style={{ color: 'var(--accent-2)', marginTop: 8 }} />
        </div>
        <div className="card">
          <div className="stat-label">Score medio / modelos</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {stats.avgValidationScore.toFixed(0)}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {' '}
              / {stats.uniqueModels}
            </span>
          </div>
        </div>
      </div>

      <div className="split">
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Flujo base</h3>
            <Link to="/tokenize" className="btn btn-ghost btn-sm">
              Ir a tokenizar <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
            <div className="card">
              <div className="badge">01</div>
              <h3>Ingestar activo IA</h3>
              <p className="muted" style={{ margin: 0 }}>
                Contenido, modelo, prompt, steward y licencia
              </p>
            </div>
            <div className="card">
              <div className="badge">02</div>
              <h3>Tokenizar</h3>
              <p className="muted" style={{ margin: 0 }}>
                contentHash · commitment · serial FST
              </p>
            </div>
            <div className="card">
              <div className="badge">03</div>
              <h3>Certificado hashcod</h3>
              <p className="muted" style={{ margin: 0 }}>
                HVC obligatorio · FIST278-4
              </p>
            </div>
            <div className="card">
              <div className="badge success">04</div>
              <h3>Validar → Sellar</h3>
              <p className="muted" style={{ margin: 0 }}>
                10 gates · human · PQC
              </p>
            </div>
          </div>

          <h3>Tokens recientes</h3>
          {loading ? (
            <div className="card empty-state">Cargando…</div>
          ) : recent.length === 0 ? (
            <div className="card empty-state">
              <Coins size={36} style={{ opacity: 0.5, marginBottom: 12 }} />
              <h3>Sin tokens todavía</h3>
              <p>La función base empieza tokenizando un output de IA.</p>
              <Link to="/tokenize" className="btn btn-primary" style={{ marginTop: 12 }}>
                Tokenizar ahora
              </Link>
            </div>
          ) : (
            recent.map((t) => (
              <Link key={t.id} to={`/tokens/${t.id}`} className="project-row">
                <div className="project-row-top">
                  <div>
                    <div className="codename">
                      {t.tokenSerial} · {t.fingerprint}
                    </div>
                    <strong>{t.asset.title}</strong>
                    <div className="tag-list">
                      <span className="badge">{t.status}</span>
                      <span className="badge neutral">{t.asset.modelId}</span>
                      {t.latestValidation && (
                        <span className="badge success">
                          {t.latestValidation.compositeScore} pts
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mono muted" style={{ fontSize: '0.75rem' }}>
                    {t.contentHash.slice(0, 12)}…
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>

        <section className="grid" style={{ gap: '1rem', alignContent: 'start' }}>
          {scoreSeries.length > 0 && (
            <div className="card">
              <h3>Scores de validación</h3>
              <BarChart values={scoreSeries} height={100} />
            </div>
          )}
          <div className="card">
            <h3>Capas complementarias</h3>
            <p className="muted">
              Tras validar un token puedes profundizar en IP estructurada, Math Lab y PQC.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/standard" className="btn btn-ghost">
                Estándar FIST278 · hashcod
              </Link>
              <Link to="/registry" className="btn btn-ghost">
                <Coins size={16} /> Registro de tokens
              </Link>
              <Link to="/projects" className="btn btn-ghost">
                <GitBranch size={16} /> Pipeline IP ({projects.length})
              </Link>
              <Link to="/mathlab" className="btn btn-ghost">
                <Calculator size={16} /> Math Lab
              </Link>
            </div>
          </div>
          <div className="card">
            <h3>Modelo de commitment</h3>
            <div className="formula mono">
              Pass ⇔ HVC_hashcod válido ∧ integridad ∧ human ∧ score≥75
            </div>
            <p className="muted" style={{ marginBottom: 0, fontSize: '0.85rem' }}>
              Sin Certificado hashcod no hay conformidad FIST278. Ver norma en Estándar FIST278.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
