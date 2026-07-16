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
  HASHCOD_KEY_EXAMPLE,
  parseHashCodKey,
  verifyHashCodCertificate,
} from '../core/hashcodCertificate';
import { BarChart, Gauge } from '../components/MathCharts';
import type { AssetToken, TokenStatus } from '../types/token';
import { FIST278_STANDARD, HASHCOD, STANDARD_MARK } from '../data/standard';

export function TokenDetail() {
  const { id } = useParams();
  const { getToken, validate, seal, remove, issueHashCodCert, uploadHashCodCert } =
    useTokens();
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
      uploadHashCodCert={uploadHashCodCert}
    />
  );
}

function TokenDetailView({
  token,
  validate,
  seal,
  remove,
  issueHashCodCert,
  uploadHashCodCert,
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
    opts?: { subject?: string; issuedBy?: string; hashcodKey?: string },
  ) => Promise<unknown>;
  uploadHashCodCert: (
    id: string,
    raw: string,
    opts?: { subject?: string },
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
  const [uploadText, setUploadText] = useState('');
  const [pasteKey, setPasteKey] = useState(HASHCOD_KEY_EXAMPLE);

  const report = token.latestValidation;
  const gateScores = useMemo(() => report?.gates.map((g) => g.score) ?? [], [report]);
  const hasCert = Boolean(token.hashcodCertificate);
  const keyPreview = token.hashcodCertificate?.hashcodKey;
  const keyOk = parseHashCodKey(keyPreview).ok;

  async function onUploadCert() {
    setBusy(true);
    setMsg('');
    try {
      const raw = uploadText.trim() || pasteKey.trim();
      if (!raw) throw new Error('Pega la clave hashcod o el contenido del certificado.');
      await uploadHashCodCert(token.id, raw, { subject: certSubject });
      setMsg(
        'Certificado hashcod subido. Clave en formato > |…|-…| < aceptada. Ejecuta la validación.',
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error al subir certificado');
    } finally {
      setBusy(false);
    }
  }

  async function onFileChange(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setUploadText(text);
  }

  async function onIssueCert() {
    setBusy(true);
    setMsg('');
    try {
      const keyParse = parseHashCodKey(pasteKey);
      await issueHashCodCert(token.id, {
        subject: certSubject,
        issuedBy: HASHCOD.legalName,
        hashcodKey: keyParse.ok ? keyParse.key : undefined,
      });
      setMsg(
        'Certificado hashcod emitido con clave en formato de plataforma. Ejecuta la validación FIST278.',
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
      ? ` · Certificado hashcod VÁLIDO (${token.hashcodCertificate?.certSerial}).`
      : ` · Certificado hashcod NO válido: ${cv.reasons[0] ?? 'ausente'}`;
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
            {hasCert && keyOk ? (
              <span className="badge success">hashcod HVC · clave OK</span>
            ) : hasCert ? (
              <span className="badge danger">HVC sin clave válida</span>
            ) : (
              <span className="badge danger">Sin certificado hashcod</span>
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

      {/* Certificado hashcod — subida + clave obligatoria */}
      <div className="card" style={{ marginBottom: '1.25rem', borderWidth: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p className="kicker">Autoridad hashcod · clave obligatoria</p>
            <h3 style={{ margin: 0 }}>
              <Award size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Certificado hashcod (subir + clave)
            </h3>
            <p className="muted" style={{ margin: '0.5rem 0 0', maxWidth: '72ch' }}>
              Para validar en la plataforma el certificado <strong>debe subirse</strong> y
              presentar una clave con este formato (solo <code>|</code> y <code>-</code> entre{' '}
              <code>&gt;</code> y <code>&lt;</code>):
            </p>
            <div
              className="formula mono"
              style={{ fontSize: '0.72rem', wordBreak: 'break-all', marginTop: 8 }}
            >
              {HASHCOD_KEY_EXAMPLE}
            </div>
          </div>
          <Link to="/standard" className="btn btn-ghost btn-sm">
            Ver norma FIST278
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label>Sujeto del certificado</label>
            <input
              value={certSubject}
              onChange={(e) => setCertSubject(e.target.value)}
              placeholder="Organización o steward certificado"
            />
          </div>

          <div className="form-group">
            <label>
              Clave hashcod (obligatoria) — debe decir el valor en forma &gt; |||||------|…| &lt;
            </label>
            <textarea
              className="mono"
              value={pasteKey}
              onChange={(e) => setPasteKey(e.target.value)}
              placeholder={HASHCOD_KEY_EXAMPLE}
              style={{ minHeight: 72, fontSize: '0.78rem' }}
            />
            <span className="muted" style={{ fontSize: '0.78rem' }}>
              {parseHashCodKey(pasteKey).ok
                ? '✓ Formato de clave válido para la plataforma'
                : parseHashCodKey(pasteKey).error}
            </span>
          </div>

          <div className="form-group">
            <label>Subir archivo de certificado (.json / .txt / .hvc)</label>
            <input
              type="file"
              accept=".json,.txt,.hvc,.cert,text/plain,application/json"
              onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="form-group">
            <label>O pega el contenido del certificado (JSON o texto con la clave)</label>
            <textarea
              className="mono"
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder={`{\n  "issuer": "hashcod",\n  "hashcodKey": "${HASHCOD_KEY_EXAMPLE}",\n  "standard": "FIST278"\n}`}
              style={{ minHeight: 100, fontSize: '0.78rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={onUploadCert}
            >
              <Award size={16} /> Subir certificado hashcod
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={onIssueCert}>
              Emitir con esta clave (local)
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPasteKey(HASHCOD_KEY_EXAMPLE)}
            >
              Usar clave de ejemplo
            </button>
          </div>
        </div>

        {hasCert && (
          <div style={{ marginTop: '1.25rem', borderTop: '2px solid #000', paddingTop: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>
              Certificado adjunto {keyOk ? '· clave OK' : '· clave inválida'}
            </h3>
            <div
              className="formula mono"
              style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}
            >
              {keyPreview}
            </div>
            <table className="table">
              <tbody>
                <tr>
                  <td className="muted">Serial HVC</td>
                  <td className="mono">{token.hashcodCertificate!.certSerial}</td>
                </tr>
                <tr>
                  <td className="muted">Origen</td>
                  <td>{token.hashcodCertificate!.source}</td>
                </tr>
                <tr>
                  <td className="muted">Emisor</td>
                  <td>{token.hashcodCertificate!.issuer}</td>
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
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={downloadCert}>
                <Download size={14} /> Export HVC JSON
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => copy(token.hashcodCertificate!.hashcodKey)}
              >
                <Copy size={12} /> Copiar clave
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
            10 gates. <strong>Gate crítico:</strong> Certificado hashcod. Sin HVC válido no hay{' '}
            <code>pass</code>.
          </p>

          {(!hasCert || !keyOk) && (
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
                Sube un certificado hashcod cuya clave sea del tipo{' '}
                <code>&gt; |||||------|---|-|-|-|||…| &lt;</code>. Sin esa clave la plataforma no
                puede dar pass.
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
