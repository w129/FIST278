import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Shield,
  FilePlus,
  Trash2,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { STAGES, DOMAIN_LABELS, STATUS_LABELS, READINESS_LEVELS } from '../data/methodology';
import { DEFAULT_PQC_OPTIONS } from '../data/postquantum';
import {
  addIPAsset,
  completeStage,
  overallProgress,
  recomputeReadiness,
  setStageNotes,
  toggleChecklistItem,
} from '../store/storage';
import type { StageId, IPAsset, Project } from '../types';
import { ReadinessBadge } from '../components/LevelMeter';
import { ProjectMathPanel } from '../components/ProjectMathPanel';
import { analyzeProject, formatNum } from '../math/engine';

export function ProjectDetail() {
  const { id } = useParams();
  const { getProject, saveProject, removeProject } = useProjects();
  const project = getProject(id ?? '');

  if (!project) {
    return (
      <div className="card empty-state">
        <h3>Proyecto no encontrado</h3>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: 12 }}>
          Volver al portafolio
        </Link>
      </div>
    );
  }

  return (
    <ProjectDetailView
      project={project}
      saveProject={saveProject}
      removeProject={removeProject}
    />
  );
}

function ProjectDetailView({
  project,
  saveProject,
  removeProject,
}: {
  project: Project;
  saveProject: (p: Project) => void;
  removeProject: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<StageId>('s0_spark');
  const [tab, setTab] = useState<'pipeline' | 'pqc' | 'ip' | 'math' | 'readiness'>('pipeline');
  const mathSnap = analyzeProject(project);

  const stageDef = useMemo(
    () => STAGES.find((s) => s.id === selectedStage)!,
    [selectedStage],
  );

  const stageProgress = project.stages.find((s) => s.stageId === selectedStage)!;
  const progress = overallProgress(project);

  function update(mutator: (p: Project) => Project) {
    saveProject(mutator(project));
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/projects" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Portafolio
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div className="codename">{project.codename}</div>
          <h2 style={{ marginTop: 4 }}>{project.name}</h2>
          <p className="subtitle">{project.vision || 'Sin visión documentada.'}</p>
          <div className="tag-list">
            <span className="badge">{STATUS_LABELS[project.status]}</span>
            <span className="badge neutral">{DOMAIN_LABELS[project.domain]}</span>
            {project.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-value" style={{ fontSize: '2rem' }}>
            {progress}%
          </div>
          <div className="stat-label">Pipeline</div>
          <div className="progress-bar" style={{ width: 140, marginTop: 8, marginLeft: 'auto' }}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <ReadinessBadge label="TRL · Tecnología" level={project.trl} />
          <p className="muted" style={{ margin: '0.5rem 0 0', fontSize: '0.78rem' }}>
            {READINESS_LEVELS.trl.levels[project.trl - 1]}
          </p>
        </div>
        <div className="card">
          <ReadinessBadge label="IPRL · IP" level={project.iprl} />
          <p className="muted" style={{ margin: '0.5rem 0 0', fontSize: '0.78rem' }}>
            {READINESS_LEVELS.iprl.levels[project.iprl - 1]}
          </p>
        </div>
        <div className="card">
          <ReadinessBadge label="PQRL · Post-Q" level={project.pqrl} />
          <p className="muted" style={{ margin: '0.5rem 0 0', fontSize: '0.78rem' }}>
            {READINESS_LEVELS.pqrl.levels[project.pqrl - 1]}
          </p>
        </div>
        <div className="card">
          <div className="stat-label">RII · Grade {mathSnap.grade}</div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>
            {mathSnap.rii.toFixed(1)}
          </div>
          <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.78rem' }}>
            Φ={mathSnap.compositeScore.toFixed(1)} · VaR {formatNum(mathSnap.hndlMc.var95)}
          </p>
        </div>
      </div>

      <div className="tabs">
        {(
          [
            ['pipeline', 'Pipeline R-IP'],
            ['math', 'Motor matemático'],
            ['pqc', 'Stack & Threat PQC'],
            ['ip', 'Activos IP'],
            ['readiness', 'Problema & metadatos'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'math' && (
        <ProjectMathPanel project={project} onChange={(p) => saveProject(p)} />
      )}

      {tab === 'pipeline' && (
        <>
          <div className="stage-rail">
            {STAGES.map((s) => {
              const sp = project.stages.find((x) => x.stageId === s.id)!;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`stage-pill ${selectedStage === s.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStage(s.id)}
                >
                  <div className="order">
                    S{s.order} · {sp.status === 'locked' ? '🔒' : sp.status === 'completed' ? '✓' : `${sp.score}%`}
                  </div>
                  <div className="name">{s.name}</div>
                </button>
              );
            })}
          </div>

          <div className="split">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <p className="kicker">
                    Etapa {stageDef.order} · {stageProgress.status}
                  </p>
                  <h3 style={{ margin: 0 }}>{stageDef.name}</h3>
                  <p className="muted" style={{ margin: '0.35rem 0 0' }}>
                    {stageDef.subtitle}
                  </p>
                </div>
                <div>
                  {stageProgress.status === 'locked' ? (
                    <span className="badge neutral">
                      <Lock size={12} /> Bloqueada
                    </span>
                  ) : stageProgress.status === 'completed' ? (
                    <span className="badge success">
                      <CheckCircle2 size={12} /> Completada
                    </span>
                  ) : (
                    <span className="badge warning">{stageProgress.score}% checklist</span>
                  )}
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{stageDef.description}</p>

              <h4 style={{ marginBottom: 8 }}>Checklist de gates</h4>
              <ul className="checklist">
                {stageProgress.checklist.map((item) => (
                  <li
                    key={item.id}
                    className={item.done ? 'done' : ''}
                    onClick={() => {
                      if (stageProgress.status === 'locked') return;
                      update((p) => toggleChecklistItem(p, selectedStage, item.id));
                    }}
                  >
                    <span className="check-box">{item.done ? '✓' : ''}</span>
                    <span className="check-label">{item.label}</span>
                  </li>
                ))}
              </ul>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label>Notas de etapa / evidencia</label>
                <textarea
                  value={stageProgress.notes}
                  disabled={stageProgress.status === 'locked'}
                  onChange={(e) => update((p) => setStageNotes(p, selectedStage, e.target.value))}
                  placeholder="Decisiones, links a docs, resultados de experimentos..."
                />
              </div>

              {stageProgress.status !== 'locked' && stageProgress.status !== 'completed' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => update((p) => completeStage(p, selectedStage))}
                >
                  <CheckCircle2 size={16} /> Marcar etapa completa y desbloquear siguiente
                </button>
              )}
            </div>

            <div className="grid" style={{ gap: '1rem', alignContent: 'start' }}>
              <div className="card">
                <h3>Entregables</h3>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)' }}>
                  {stageDef.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3>Gates de calidad</h3>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)' }}>
                  {stageDef.gates.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
              {selectedStage === 's6_pqc_hardening' && (
                <div className="card">
                  <h3>
                    <Shield size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Atajo PQC
                  </h3>
                  <p className="muted">Configura el stack en la pestaña Stack & Threat PQC.</p>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTab('pqc')}>
                    Ir a configuración PQC
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'pqc' && (
        <div className="split">
          <div className="card">
            <h3>Stack criptográfico post-cuántico</h3>
            <div className="form-group">
              <label>KEM</label>
              <select
                value={project.pqcStack.kem}
                onChange={(e) =>
                  update((p) =>
                    recomputeReadiness({
                      ...p,
                      pqcStack: { ...p.pqcStack, kem: e.target.value },
                    }),
                  )
                }
              >
                {DEFAULT_PQC_OPTIONS.kems.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Firma digital</label>
              <select
                value={project.pqcStack.signature}
                onChange={(e) =>
                  update((p) =>
                    recomputeReadiness({
                      ...p,
                      pqcStack: { ...p.pqcStack, signature: e.target.value },
                    }),
                  )
                }
              >
                {DEFAULT_PQC_OPTIONS.signatures.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Hash / XOF</label>
              <select
                value={project.pqcStack.hash}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    pqcStack: { ...p.pqcStack, hash: e.target.value },
                  }))
                }
              >
                {DEFAULT_PQC_OPTIONS.hashes.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={project.pqcStack.hybridMode}
                onChange={(e) =>
                  update((p) =>
                    recomputeReadiness({
                      ...p,
                      pqcStack: { ...p.pqcStack, hybridMode: e.target.checked },
                    }),
                  )
                }
              />
              Modo híbrido clásico + PQC
            </label>
            <div className="form-group">
              <label>Notas de integración</label>
              <textarea
                value={project.pqcStack.notes}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    pqcStack: { ...p.pqcStack, notes: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="card">
            <h3>Threat model · HNDL</h3>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={project.threatModel.harvestNowDecryptLater}
                onChange={(e) =>
                  update((p) =>
                    recomputeReadiness({
                      ...p,
                      threatModel: {
                        ...p.threatModel,
                        harvestNowDecryptLater: e.target.checked,
                      },
                    }),
                  )
                }
              />
              Riesgo Harvest-Now-Decrypt-Later relevante
            </label>
            <div className="form-group">
              <label>Horizonte de migración</label>
              <select
                value={project.threatModel.migrationHorizon}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    threatModel: {
                      ...p.threatModel,
                      migrationHorizon: e.target.value as typeof p.threatModel.migrationHorizon,
                    },
                  }))
                }
              >
                <option value="2026">2026</option>
                <option value="2027-2028">2027–2028</option>
                <option value="2029-2030">2029–2030</option>
                <option value="2030+">2030+</option>
              </select>
            </div>
            <div className="form-group">
              <label>Crypto clásica expuesta (coma-separado)</label>
              <input
                value={project.threatModel.classicalCryptoExposed.join(', ')}
                onChange={(e) =>
                  update((p) =>
                    recomputeReadiness({
                      ...p,
                      threatModel: {
                        ...p.threatModel,
                        classicalCryptoExposed: e.target.value
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean),
                      },
                    }),
                  )
                }
                placeholder="RSA-2048, ECDHE, JWT RS256..."
              />
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={project.threatModel.hybridRequired}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    threatModel: { ...p.threatModel, hybridRequired: e.target.checked },
                  }))
                }
              />
              Híbrido obligatorio en transición
            </label>
            <div className="form-group">
              <label>Notas de amenaza</label>
              <textarea
                value={project.threatModel.notes}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    threatModel: { ...p.threatModel, notes: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'ip' && (
        <IPAssetsPanel
          assets={project.ipAssets}
          onAdd={(asset) => update((p) => addIPAsset(p, asset))}
        />
      )}

      {tab === 'readiness' && (
        <div className="split">
          <div className="card">
            <h3>Problema crítico</h3>
            <div className="form-group">
              <label>Problem statement</label>
              <textarea
                value={project.problem}
                onChange={(e) => update((p) => ({ ...p, problem: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Visión</label>
              <textarea
                value={project.vision}
                onChange={(e) => update((p) => ({ ...p, vision: e.target.value }))}
              />
            </div>
          </div>
          <div className="card">
            <h3>Zona peligrosa</h3>
            <p className="muted">Eliminar el proyecto es irreversible (datos locales).</p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm(`¿Eliminar ${project.codename}?`)) {
                  removeProject(project.id);
                  navigate('/projects');
                }
              }}
            >
              <Trash2 size={16} /> Eliminar proyecto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IPAssetsPanel({
  assets,
  onAdd,
}: {
  assets: IPAsset[];
  onAdd: (a: Omit<IPAsset, 'id'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [noveltyClaim, setNoveltyClaim] = useState('');
  const [kind, setKind] = useState<IPAsset['kind']>('invention');

  return (
    <div className="split">
      <div className="card">
        <h3>Activos de propiedad intelectual</h3>
        {assets.length === 0 ? (
          <p className="muted">Aún no hay activos. Añade reivindicaciones, secretos o diseños.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Jurisdicción</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.title}</strong>
                    <div className="muted" style={{ fontSize: '0.78rem' }}>
                      {a.noveltyClaim}
                    </div>
                  </td>
                  <td>{a.kind}</td>
                  <td>
                    <span className="badge">{a.status}</span>
                  </td>
                  <td>{a.jurisdiction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card">
        <h3>
          <FilePlus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Nuevo activo
        </h3>
        <div className="form-group">
          <label>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select value={kind} onChange={(e) => setKind(e.target.value as IPAsset['kind'])}>
            <option value="invention">Invención / patente</option>
            <option value="trade-secret">Secreto industrial</option>
            <option value="software">Software</option>
            <option value="protocol">Protocolo</option>
            <option value="dataset">Dataset</option>
            <option value="design">Diseño</option>
          </select>
        </div>
        <div className="form-group">
          <label>Claim de novedad</label>
          <textarea value={noveltyClaim} onChange={(e) => setNoveltyClaim(e.target.value)} />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!title.trim()}
          onClick={() => {
            onAdd({
              title: title.trim(),
              kind,
              noveltyClaim: noveltyClaim.trim(),
              inventorship: 'Por definir',
              jurisdiction: 'PCT',
              status: 'draft',
            });
            setTitle('');
            setNoveltyClaim('');
          }}
        >
          Añadir activo
        </button>
      </div>
    </div>
  );
}
