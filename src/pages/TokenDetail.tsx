import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
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
import {
  certificateExportJson,
  verifyHashCodCertificate,
} from '../core/hashcodCertificate';
import { BarChart, Gauge } from '../components/MathCharts';
import type { AssetToken, TokenStatus } from '../types/token';
import { FIST278_STANDARD, HASHCOD, STANDARD_MARK } from '../data/standard';

export function TokenDetail() {
  const { id } = useParams();
  const { getToken, validate, seal, remove, issueHashCodCert } = useTokens();
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
    <TokenDetailView
      token={token}
      validate={validate}
      seal={seal}
      remove={remove}
      issueHashCodCert={issueHashCodCert}
    />
  );
}

function TokenDetailView({
  token,
  validate,
  seal,
  remove,
  issueHashCodCert,
}: {
  token: AssetToken;
  validate: (
    id: string,
    opts?: { humanApproved?: boolean; humanNotes?: string },
  ) => Promise<unknown>;
  seal: (id: string) => Promise<unknown>;
  remove: (id: string) => void;
  issueHashCodCert: (
    id: string,
    opts?: { subject?: string; issuedBy?: string },
  ) => Promise<unknown>;
}) {
  const navigate = useNavigate();
  const [humanApproved, setHumanApproved] = useState(false);
  const [humanNotes, setHumanNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [integrity, setIntegrity] = useState('');
  const [certSubject, setCertSubject] = useState(
    token.asset.steward || token.tokenSerial,
  );

  const report = token.latestValidation;
  const gateScores = useMemo(() => report?.gates.map((g) => g.score) ?? [], [report]);
  const hasCert = Boolean(token.hashcodCertificate);

  async function onIssueCert() {
    setBusy(true);
    setMsg('');
    try {
      await issueHashCodCert(token.id, {
        subject: certSubject,
        issuedBy: HASHCOD.legalName,
      });
      setMsg(
        'Certificado HashCod (HVC) emitido. Ahora puedes ejecutar la validación FIST278.',
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo emitir el certificado');
    } finally {
      setBusy(false);
    }
  }

  async function onValidate() {
    setBusy(true);
    setMsg('');
    try {
      await validate(token.id, { humanApproved, humanNotes });
      setMsg('Validación FIST278 ejecutada.');
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
      setMsg('Token sellado (PQC-ready) bajo FIST278.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo sellar');
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    const r = await verifyTokenIntegrity(token);
    let line =
      r.contentOk && r.metadataOk && r.commitmentOk
        ? 'Integridad OK: content, metadata y commitment verificados.'
        : `Integridad FALLÓ: content=${r.contentOk} meta=${r.metadataOk} commit=${r.commitmentOk}`;
    const cv = await verifyHashCodCertificate(token.hashcodCertificate, token);
    line += cv.valid
      ? ` · Certificado HashCod VÁLIDO (${token.hashcodCertificate?.certSerial}).`
      : ` · Certificado HashCod NO válido: ${cv.reasons[0] ?? 'ausente'}`;
    setIntegrity(line);
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

  function downloadCert() {
    if (!token.hashcodCertificate) return;
    const blob = new Blob([certificateExportJson(token.hashcodCertificate)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${token.hashcodCertificate.certSerial}.json`;
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
            {token.tokenSerial} · fp {token.fingerprint} · {FIST278_STANDARD.id}
          </div>
          <h2 style={{ marginTop: 4 }}>{token.asset.title}</h2>
          <p className="subtitle">{token.asset.description || 'Sin descripción.'}</p>
          <div className="tag-list">
            <StatusBadge status={token.status} />
            <span className="badge">{STANDARD_MARK}</span>
            {hasCert ? (
              <span className="badge success">HashCod HVC</span>
            ) : (
              <span className="badge danger">Sin certificado HashCod</span>
            )}
            <span className="badge neutral">{token.asset.kind}</span>
            <span className="badge neutral mono">{token.asset.modelId}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onVerify}>
            Verificar hashes + HVC
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={downloadExport}>
            <Download size={14} /> Export token
          </button>
        </div>
      </div>

      {(msg || integrity) && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          {msg && <p style={{ margin: 0 }}>{msg}</p>}
          {integrity && (
            <p className="mono" style={{ margin: msg ? '0.5rem 0 0' : 0, fontSize: '0.85rem' }}>
              {integrity}
            </p>
          )}
        </div>
      )}

      {/* Certificado HashCod — bloque prioritario */}
      <div className="card" style={{ marginBottom: '1.25rem', borderWidth: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p className="kicker">Autoridad de certificación</p>
            <h3 style={{ margin: 0 }}>
              <Award size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Certificado HashCod (obligatorio FIST278)
            </h3>
            <p className="muted" style={{ margin: '0.5rem 0 0', maxWidth: '70ch' }}>
              FIST278 es un <strong>estándar internacional</strong> publicado por{' '}
              <strong>{HASHCOD.org}</strong>. La validación solo puede dar{' '}
              <strong>pass</strong> si existe un Certificado HashCod (HVC) vigente que
              valide este token.
            </p>
          </div>
          <Link to="/standard" className="btn btn-ghost btn-sm">
            Ver norma FIST278
          </Link>
        </div>

        {!hasCert ? (
          <div style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Sujeto del certificado</label>
              <input
                value={certSubject}
                onChange={(e) => setCertSubject(e.target.value)}
                placeholder="Organización o steward certificado"
              />
            </div>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={onIssueCert}>
              <Award size={16} /> Emitir Certificado HashCod
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <table className="table">
              <tbody>
                <tr>
                  <td className="muted">Serial HVC</td>
                  <td className="mono">{token.hashcodCertificate!.certSerial}</td>
                </tr>
                <tr>
                  <td className="muted">Emisor</td>
                  <td>
                    {token.hashcodCertificate!.issuer} · {token.hashcodCertificate!.issuerId}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Estándar</td>
                  <td>
                    {token.hashcodCertificate!.standard} v
                    {token.hashcodCertificate!.standardVersion}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Sujeto</td>
                  <td>{token.hashcodCertificate!.subject}</td>
                </tr>
                <tr>
                  <td className="muted">Vigencia</td>
                  <td className="mono" style={{ fontSize: '0.8rem' }}>
                    {token.hashcodCertificate!.issuedAt} → {token.hashcodCertificate!.expiresAt}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Firma HashCod</td>
                  <td className="mono" style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>
                    {token.hashcodCertificate!.signature}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Marca</td>
                  <td>
                    <strong>{token.hashcodCertificate!.mark}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={downloadCert}>
                <Download size={14} /> Export HVC JSON
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => copy(token.hashcodCertificate!.signature)}
              >
                <Copy size={12} /> Copiar firma
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                disabled={busy}
                onClick={onIssueCert}
              >
                Reemitir certificado
              </button>
            </div>
          </div>
        )}
      </div>

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
          <p
            className="mono"
            style={{ fontSize: '0.72rem', wordBreak: 'break-all', margin: '0.4rem 0' }}
          >
            {token.contentHash}
          </p>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => copy(token.contentHash)}
          >
            <Copy size={12} /> Copiar
          </button>
        </div>
        <div className="card">
          <div className="stat-label">Commitment</div>
          <p
            className="mono"
            style={{ fontSize: '0.72rem', wordBreak: 'break-all', margin: '0.4rem 0' }}
          >
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
          </p>
        </div>
      </div>

      <div className="split" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <h3>
            <ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Pipeline de validación FIST278
          </h3>
          <p className="muted" style={{ fontSize: '0.88rem' }}>
            10 gates. <strong>Gate crítico:</strong> Certificado HashCod. Sin HVC válido no hay{' '}
            <code>pass</code>.
          </p>

          {!hasCert && (
            <div
              className="card"
              style={{
                marginBottom: 12,
                background: '#fff',
                borderStyle: 'dashed',
              }}
            >
              <strong>Bloqueo normativo FIST278-4</strong>
              <p className="muted" style={{ margin: '0.35rem 0 0' }}>
                Emite primero el Certificado HashCod (arriba). Después marca la aprobación
                humana y ejecuta la validación.
              </p>
            </div>
          )}

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
              <Shield size={16} /> Ejecutar validación FIST278
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
                labels={report.gates.map((g) =>
                  g.gateId === 'hashcod_certificate' ? 'HVC' : g.gateId.slice(0, 4),
                )}
                height={110}
              />
              <ul className="checklist" style={{ marginTop: 12 }}>
                {report.gates.map((g) => (
                  <li
                    key={g.gateId}
                    className={g.passed ? 'done' : ''}
                    style={
                      g.gateId === 'hashcod_certificate' && !g.passed
                        ? { borderWidth: 2 }
                        : undefined
                    }
                  >
                    <span className="check-box">
                      {g.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    </span>
                    <span className="check-label">
                      <strong>
                        {g.name} · {g.score}
                        {g.gateId === 'hashcod_certificate' ? ' · CRÍTICO' : ''}
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
                  <td className="muted">Estándar</td>
                  <td>{token.standardId ?? 'FIST278'}</td>
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
              </p>
            </div>
          )}

          <div className="card">
            <h3>Contenido</h3>
            <pre
              className="mono"
              style={{
                margin: 0,
                maxHeight: 220,
                overflow: 'auto',
                fontSize: '0.78rem',
                whiteSpace: 'pre-wrap',
                background: '#fff',
                padding: '0.75rem',
                border: '2px solid #000',
              }}
            >
              {token.asset.content}
            </pre>
          </div>

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
