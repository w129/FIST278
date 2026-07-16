import { useState } from 'react';
import { Shield, Zap, Layers, GitMerge } from 'lucide-react';
import {
  HNDL_PRINCIPLES,
  MIGRATION_PHASES,
  PQC_ALGORITHMS,
} from '../data/postquantum';

export function PostQuantumLab() {
  const [filter, setFilter] = useState<'all' | 'KEM' | 'Signature' | 'Hash' | 'Symmetric'>('all');
  const algos =
    filter === 'all' ? PQC_ALGORITHMS : PQC_ALGORITHMS.filter((a) => a.role === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Laboratorio</p>
          <h2>Desarrollo post-cuántico</h2>
          <p className="subtitle">
            Referencia operativa para migración PQC, algoritmos NIST y principios de
            crypto-agility. Úsalo junto al pipeline de cada proyecto.
          </p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <Shield size={20} color="#000000" />
          <h3 style={{ marginTop: 8 }}>FIPS 203</h3>
          <p className="muted" style={{ margin: 0 }}>
            ML-KEM · encapsulación de claves
          </p>
        </div>
        <div className="card">
          <Zap size={20} color="#000000" />
          <h3 style={{ marginTop: 8 }}>FIPS 204</h3>
          <p className="muted" style={{ margin: 0 }}>
            ML-DSA · firmas lattice
          </p>
        </div>
        <div className="card">
          <Layers size={20} color="#000000" />
          <h3 style={{ marginTop: 8 }}>FIPS 205</h3>
          <p className="muted" style={{ margin: 0 }}>
            SLH-DSA · firmas hash-based
          </p>
        </div>
        <div className="card">
          <GitMerge size={20} color="#000000" />
          <h3 style={{ marginTop: 8 }}>Híbrido</h3>
          <p className="muted" style={{ margin: 0 }}>
            Clásico + PQC en transición
          </p>
        </div>
      </div>

      <h3>Principios de diseño</h3>
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        {HNDL_PRINCIPLES.map((p) => (
          <div key={p.title} className="card">
            <h3>{p.title}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {p.body}
            </p>
          </div>
        ))}
      </div>

      <h3>Roadmap de migración (6 fases)</h3>
      <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
        {MIGRATION_PHASES.map((phase) => (
          <div key={phase.id} className="card">
            <div className="badge" style={{ marginBottom: 8 }}>
              {phase.horizon}
            </div>
            <h3>{phase.name}</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {phase.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ margin: 0 }}>Catálogo de algoritmos</h3>
        <div className="tabs" style={{ margin: 0 }}>
          {(['all', 'KEM', 'Signature', 'Hash', 'Symmetric'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        {algos.map((algo) => (
          <div key={algo.id} className="card algo-card">
            <h3>
              {algo.name}
              <span className="badge success">{algo.nistStatus}</span>
              <span className="badge neutral">{algo.role}</span>
            </h3>
            <p className="muted" style={{ marginTop: 0 }}>
              <strong>Familia:</strong> {algo.family}
              <br />
              <strong>Seguridad:</strong> {algo.securityLevel}
              <br />
              <strong>Tamaños:</strong> {algo.sizeNotes}
            </p>
            <div>
              <div className="stat-label" style={{ marginBottom: 6 }}>
                Casos de uso
              </div>
              <div className="tag-list">
                {algo.useCases.map((u) => (
                  <span key={u} className="tag">
                    {u}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="stat-label" style={{ marginBottom: 6 }}>
                Tips de migración
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {algo.migrationTips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
