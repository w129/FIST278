import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { overallProgress } from '../store/storage';
import { DOMAIN_LABELS, STATUS_LABELS } from '../data/methodology';
import { ReadinessBadge } from '../components/LevelMeter';

export function Projects() {
  const { projects, removeProject } = useProjects();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Portafolio</p>
          <h2>Proyectos de IP</h2>
          <p className="subtitle">
            Gestiona invenciones y programas de migración post-cuántica bajo la metodología R-IP/PQ.
          </p>
        </div>
        <Link to="/new" className="btn btn-primary">
          <Plus size={18} /> Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card empty-state">
          <h3>Portafolio vacío</h3>
          <p>Crea un proyecto para iniciar el pipeline estructurado.</p>
          <Link to="/new" className="btn btn-primary" style={{ marginTop: 12 }}>
            Crear proyecto
          </Link>
        </div>
      ) : (
        projects.map((p) => {
          const progress = overallProgress(p);
          return (
            <div key={p.id} className="project-row" style={{ cursor: 'default' }}>
              <div className="project-row-top">
                <div>
                  <div className="codename">{p.codename}</div>
                  <Link to={`/projects/${p.id}`}>
                    <strong style={{ fontSize: '1.05rem' }}>{p.name}</strong>
                  </Link>
                  <p className="muted" style={{ margin: '0.35rem 0 0', maxWidth: '70ch' }}>
                    {p.vision}
                  </p>
                  <div className="tag-list">
                    <span className="badge">{STATUS_LABELS[p.status]}</span>
                    <span className="badge neutral">{DOMAIN_LABELS[p.domain]}</span>
                    {p.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                    {progress}%
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/projects/${p.id}`} className="btn btn-sm btn-primary">
                      Abrir pipeline
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (confirm(`¿Eliminar proyecto ${p.codename}?`)) removeProject(p.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="progress-bar" style={{ marginTop: 14 }}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-3" style={{ marginTop: 12 }}>
                <ReadinessBadge label="TRL · Tecnología" level={p.trl} />
                <ReadinessBadge label="IPRL · Propiedad intelectual" level={p.iprl} />
                <ReadinessBadge label="PQRL · Post-cuántico" level={p.pqrl} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
