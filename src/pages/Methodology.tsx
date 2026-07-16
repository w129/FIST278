import { STAGES, READINESS_LEVELS } from '../data/methodology';

export function Methodology() {
  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Framework</p>
          <h2>Metodología R-IP/PQ</h2>
          <p className="subtitle">
            Desarrollo estructurado de propiedad intelectual revolucionaria con endurecimiento
            post-cuántico embebido. Diez etapas, tres ejes de madurez, gates explícitos.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Filosofía</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          Las IP revolucionarias no se improvisan: se <strong>industrializan</strong>. FIST278
          fuerza rigor en prior art, claim tree, reducción a práctica y seguridad post-cuántica
          antes de escalar. El pipeline evita dos trampas clásicas: patentar humo y construir
          sistemas que un CRQC invalidará en la década.
        </p>
      </div>

      <h3>Tres ejes de madurez</h3>
      <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
        {(Object.entries(READINESS_LEVELS) as [string, (typeof READINESS_LEVELS)['trl']][]).map(
          ([key, def]) => (
            <div key={key} className="card">
              <h3>{def.name}</h3>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {def.levels.map((l, i) => (
                  <li key={l}>
                    <span className="mono" style={{ color: 'var(--accent)' }}>
                      L{i + 1}
                    </span>{' '}
                    {l}
                  </li>
                ))}
              </ol>
            </div>
          ),
        )}
      </div>

      <h3>Pipeline de 10 etapas</h3>
      <div className="grid" style={{ gap: '0.85rem' }}>
        {STAGES.map((s) => (
          <div key={s.id} className="card">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                className="brand-mark"
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  fontSize: '0.85rem',
                  background: '#000000',
                  color: '#ffffff',
                }}
              >
                S{s.order}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{s.name}</h3>
                <p className="muted" style={{ margin: '0.25rem 0 0.75rem' }}>
                  {s.subtitle} — {s.description}
                </p>
                <div className="grid grid-2">
                  <div>
                    <div className="stat-label">Entregables</div>
                    <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {s.deliverables.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="stat-label">Gates</div>
                    <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {s.gates.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
