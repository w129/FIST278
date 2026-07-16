import { Link } from 'react-router-dom';
import { Coins, Trash2 } from 'lucide-react';
import { useTokens } from '../context/TokenContext';
import type { TokenStatus } from '../types/token';

const STATUS_LABEL: Record<TokenStatus, string> = {
  draft: 'Borrador',
  tokenized: 'Tokenizado',
  validating: 'Validando',
  validated: 'Validado',
  rejected: 'Rechazado',
  sealed: 'Sellado',
  revoked: 'Revocado',
};

const STATUS_BADGE: Record<TokenStatus, string> = {
  draft: 'neutral',
  tokenized: '',
  validating: 'warning',
  validated: 'success',
  rejected: 'danger',
  sealed: 'success',
  revoked: 'danger',
};

export function TokenRegistry() {
  const { tokens, stats, remove, loading } = useTokens();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Registro</p>
          <h2>Tokens de activos IA</h2>
          <p className="subtitle">
            Inventario de activos tokenizados y su estado de validación / sello.
          </p>
        </div>
        <Link to="/" className="btn btn-primary">
          <Coins size={16} /> Tokenizar nuevo
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="card">
          <div className="stat-label">Validados</div>
          <div className="stat-value">{stats.validated}</div>
        </div>
        <div className="card">
          <div className="stat-label">Sellados PQC</div>
          <div className="stat-value">{stats.sealed}</div>
        </div>
        <div className="card">
          <div className="stat-label">Score medio validación</div>
          <div className="stat-value">{stats.avgValidationScore.toFixed(0)}</div>
        </div>
      </div>

      {loading ? (
        <div className="card empty-state">Cargando registro…</div>
      ) : tokens.length === 0 ? (
        <div className="card empty-state">
          <h3>Registro vacío</h3>
          <p>Tokeniza tu primer activo generado por IA.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Empezar
          </Link>
        </div>
      ) : (
        tokens.map((t) => (
          <div key={t.id} className="project-row" style={{ cursor: 'default' }}>
            <div className="project-row-top">
              <div>
                <div className="codename">
                  {t.tokenSerial} · {t.fingerprint}
                </div>
                <Link to={`/tokens/${t.id}`}>
                  <strong style={{ fontSize: '1.05rem' }}>{t.asset.title}</strong>
                </Link>
                <p className="muted" style={{ margin: '0.35rem 0 0', maxWidth: '70ch' }}>
                  {t.asset.description || t.asset.content.slice(0, 140) + '…'}
                </p>
                <div className="tag-list">
                  <span className={`badge ${STATUS_BADGE[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                  <span className="badge neutral">{t.asset.kind}</span>
                  <span className="badge neutral mono">{t.asset.modelId}</span>
                  {t.latestValidation && (
                    <span className="badge">
                      val {t.latestValidation.compositeScore} · {t.latestValidation.decision}
                    </span>
                  )}
                  {t.asset.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div className="mono muted" style={{ fontSize: '0.75rem' }}>
                  {t.contentHash.slice(0, 16)}…
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/tokens/${t.id}`} className="btn btn-sm btn-primary">
                    Abrir
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      if (confirm(`¿Eliminar ${t.tokenSerial}?`)) remove(t.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
