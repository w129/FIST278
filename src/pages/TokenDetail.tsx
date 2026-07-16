import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  Copy,
  Download,
  Shield,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useTokens } from '../context/TokenContext';
import { tokenExportEnvelope, verifyTokenIntegrity } from '../core/tokenize';
import { BarChart, Gauge } from '../components/MathCharts';
import type { TokenStatus } from '../types/token';

export function TokenDetail() {
  const { id } = useParams();
  const { getToken, validate, seal, remove } = useTokens();
  const token = getToken(id ?? '');

  if (!token) {
    return (
      <div className="card empty-state">
        <h3>Token no encontrado</h3>
        <Link to="/registry" className="btn btn-primary" style={{ marginTop: 12 }}>
          Ir al registro
        </Link>
      </div>
    );
  }

  return (
    <TokenDetailView token={token} validate={validate} seal={seal} remove={remove} />
  );
}

function TokenDetailView({
  token,
  validate,
  seal,
  remove,
}: {
  token: import('../types/token').AssetToken;
  validate: (id: string, opts?: { humanApproved?: boolean; humanNotes?: string }) => Promise<unknown>;
  seal: (id: string) => Promise<unknown>;
  remove: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [humanApproved, setHumanApproved] = useState(false);
  const [humanNotes, setHumanNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [integrity, setIntegrity] = useState<string>('');

  const report = token.latestValidation;

  const gateScores = useMemo(
    () => report?.gates.map((g) => g.score) ?? [],
    [report],
  );

  async function onValidate() {
    setBusy(true);
    setMsg('');
    try {
      await validate(token.id, {
        humanApproved,
        humanNotes,
      });
      setMsg('Validación ejecutada.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error de validación');
    } finally {
      setBusy(false);
    }
  }

  async function onSeal() {
    setBusy(true);
    setMsg('');
    try {
      await seal(token.id);
      setMsg('Token sellado (PQC-ready).');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo sellar');
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    const r = await verifyTokenIntegrity(token);
    setIntegrity(
      r.contentOk && r.metadataOk && r.commitmentOk
        ? 'Integridad OK: content, metadata y commitment verificados.'
        : `Integridad FALLÓ: content=${r.contentOk} meta=${r.metadataOk} commit=${r.commitmentOk}`,
    );
  }

  function copy(text: string) {
    void navigator.clipboard?.writeText(text);
    setMsg('Copiado al portapapeles.');
  }

  function downloadExport() {
    const blob = new Blob([tokenExportEnvelope(token)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${token.tokenSerial}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/registry" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Registro
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div className="codename">
            {token.tokenSerial} · fp {token.fingerprint}
          </div>
          <h2 style={{ marginTop: 4 }}>{token.asset.title}</h2>
          <p className="subtitle">{token.asset.description || 'Sin descripción.'}</p>
          <div className="tag-list">
            <StatusBadge status={token.status} />
            <span className="badge neutral">{token.asset.kind}</span>
            <span className="badge neutral mono">{token.asset.modelId}</span>
            <span className="badge neutral">{token.asset.licenseIntent}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onVerify}>
            Verificar hashes
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={downloadExport}>
            <Download size={14} /> Export JSON
          </button>
        </div>
      </div>

      {(msg || integrity) && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--border-strong)' }}>
          {msg && <p style={{ margin: 0 }}>{msg}</p>}
          {integrity && (
            <p className="mono" style={{ margin: msg ? '0.5rem 0 0' : 0, fontSize: '0.85rem' }}>
              {integrity}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Gauge value={report?.compositeScore ?? 0} label="Score validación" />
          {report && (
            <span
              className={`badge ${
                report.decision === 'pass'
                  ? 'success'
                  : report.decision === 'conditional'
                    ? 'warning'
                    : 'danger'
              }`}
            >
              {report.decision}
            </span>
          )}
        </div>
        <div className="card">
          <div className="stat-label">Content SHA-256</div>
          <p className="mono" style={{ fontSize: '0.72rem', wordBreak: 'break-all', margin: '0.4rem 0' }}>
            {token.contentHash}
          </p>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => copy(token.contentHash)}>
            <Copy size={12} /> Copiar
          </button>
        </div>
        <div className="card">
          <div className="stat-label">Commitment</div>
          <p className="mono" style={{ fontSize: '0.72rem', wordBreak: 'break-all', margin: '0.4rem 0' }}>
            {token.commitmentHash}
          </p>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => copy(token.commitmentHash)}
          >
            <Copy size={12} /> Copiar
          </button>
        </div>
        <div className="card">
          <div className="stat-label">Features</div>
          <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem' }}>
            {token.features.wordCount} palabras · H=
            {token.features.shannonEntropy.toFixed(2)}
            <br />
            unique {(token.features.uniqueWordRatio * 100).toFixed(0)}% · rep{' '}
            {token.features.repetitionScore.toFixed(2)}
            <br />
            AI-phrase {token.features.aiPhraseSignal.toFixed(2)} · struct{' '}
            {token.features.structuralScore.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="split" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <h3>
            <ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Pipeline de validación
          </h3>
          <p className="muted" style={{ fontSize: '0.88rem' }}>
            9 gates: integridad, estructura, divulgación IA, originalidad, calidad, política,
            procedencia, sello PQC, revisión humana.
          </p>

          <label
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={humanApproved}
              onChange={(e) => setHumanApproved(e.target.checked)}
            />
            Aprobación humana (requerida para decision = pass)
          </label>
          <div className="form-group">
            <label>Notas del revisor</label>
            <textarea
              value={humanNotes}
              onChange={(e) => setHumanNotes(e.target.value)}
              placeholder="Observaciones de validación humana…"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={onValidate}>
              <Shield size={16} /> Ejecutar validación
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy || (token.status !== 'validated' && token.status !== 'sealed')}
              onClick={onSeal}
            >
              <Coins size={16} /> Sellar PQC-ready
            </button>
          </div>

          {report && (
            <>
              <p style={{ marginTop: '1rem' }}>{report.summary}</p>
              <BarChart
                values={gateScores}
                labels={report.gates.map((g) => g.gateId.slice(0, 4))}
                height={110}
              />
              <ul className="checklist" style={{ marginTop: 12 }}>
                {report.gates.map((g) => (
                  <li key={g.gateId} className={g.passed ? 'done' : ''}>
                    <span className="check-box">
                      {g.passed ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                    </span>
                    <span className="check-label">
                      <strong>
                        {g.name} · {g.score}
                      </strong>
                      <br />
                      <span className="muted" style={{ fontSize: '0.8rem' }}>
                        {g.details}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="grid" style={{ gap: '1rem', alignContent: 'start' }}>
          <div className="card">
            <h3>Procedencia</h3>
            <table className="table">
              <tbody>
                <tr>
                  <td className="muted">Modelo</td>
                  <td className="mono">{token.asset.modelId}</td>
                </tr>
                <tr>
                  <td className="muted">Steward</td>
                  <td>{token.asset.steward}</td>
                </tr>
                <tr>
                  <td className="muted">Prompt hash</td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>
                    {token.promptHash || '—'}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Metadata hash</td>
                  <td className="mono" style={{ fontSize: '0.75rem' }}>
                    {token.metadataHash.slice(0, 24)}…
                  </td>
                </tr>
                <tr>
                  <td className="muted">Tokenizado</td>
                  <td className="mono" style={{ fontSize: '0.8rem' }}>
                    {token.tokenizedAt}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {token.pqcSeal && (
            <div className="card">
              <h3>Sello PQC</h3>
              <p className="muted" style={{ marginTop: 0 }}>
                Algoritmo: <strong>{token.pqcSeal.algorithm}</strong>
                <br />
                <span className="mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {token.pqcSeal.sealHash}
                </span>
                <br />
                {token.pqcSeal.sealedAt}
              </p>
            </div>
          )}

          <div className="card">
            <h3>Contenido</h3>
            <pre
              className="mono"
              style={{
                margin: 0,
                maxHeight: 280,
                overflow: 'auto',
                fontSize: '0.78rem',
                whiteSpace: 'pre-wrap',
                background: 'var(--bg)',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}
            >
              {token.asset.content}
            </pre>
          </div>

          {token.asset.prompt && (
            <div className="card">
              <h3>Prompt</h3>
              <p className="muted" style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>
                {token.asset.prompt}
              </p>
            </div>
          )}

          <div className="card">
            <h3>Zona peligrosa</h3>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm(`¿Eliminar ${token.tokenSerial}?`)) {
                  remove(token.id);
                  navigate('/registry');
                }
              }}
            >
              Eliminar token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TokenStatus }) {
  const map: Record<TokenStatus, string> = {
    draft: 'neutral',
    tokenized: '',
    validating: 'warning',
    validated: 'success',
    rejected: 'danger',
    sealed: 'success',
    revoked: 'danger',
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
}
