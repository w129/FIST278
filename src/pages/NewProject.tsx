import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../store/storage';
import { useProjects } from '../context/ProjectContext';
import type { Domain } from '../types';
import { DOMAIN_LABELS } from '../data/methodology';

export function NewProject() {
  const { saveProject } = useProjects();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [codename, setCodename] = useState('');
  const [vision, setVision] = useState('');
  const [problem, setProblem] = useState('');
  const [domain, setDomain] = useState<Domain>('pqc-migration');
  const [tags, setTags] = useState('PQC, revolucionario');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const project = createProject({
      name: name.trim(),
      codename: (codename.trim() || name.slice(0, 8)).toUpperCase().replace(/\s+/g, '-'),
      vision: vision.trim(),
      problem: problem.trim(),
      domain,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    saveProject(project);
    navigate(`/projects/${project.id}`);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Etapa 0 · Chispa</p>
          <h2>Registrar IP revolucionaria</h2>
          <p className="subtitle">
            Captura la idea anómala. El pipeline se desbloqueará etapa por etapa con gates de calidad.
          </p>
        </div>
      </div>

      <form className="card" style={{ maxWidth: 720 }} onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre de la invención / programa</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Protocolo de firma multi-algoritmo para firmware crítico"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="codename">Codename (confidencialidad)</label>
          <input
            id="codename"
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            placeholder="Ej. ORION-65"
            className="mono"
          />
        </div>
        <div className="form-group">
          <label htmlFor="domain">Dominio</label>
          <select id="domain" value={domain} onChange={(e) => setDomain(e.target.value as Domain)}>
            {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="vision">Visión / promesa de ruptura</label>
          <textarea
            id="vision"
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="¿Qué cambia en el mundo si esto funciona?"
          />
        </div>
        <div className="form-group">
          <label htmlFor="problem">Problema crítico que resuelve</label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Contexto → Falla del estado del arte → Impacto"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (separados por coma)</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">
          Crear y abrir pipeline
        </button>
      </form>
    </div>
  );
}
