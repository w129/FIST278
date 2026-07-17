import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CLEARANCE_RANKS,
  ERROR_CODES,
  OPS_MODES,
  PIPELINE_MNEMONICS,
  PROTOCOL,
  SEMANTIC_LAYERS,
  type ClearanceLevel,
  type OpsMode,
} from '../data/opsProtocol';
import {
  CLEARANCE_PASSPHRASES,
  elevateClearance,
  loadOps,
  setMode,
  type OpsState,
} from '../store/opsStore';
import { HashcodIcon } from '../components/HashcodIcon';

export function OpsConsole() {
  const [ops, setOps] = useState<OpsState>(() => loadOps());
  const [phrase, setPhrase] = useState('');
  const [target, setTarget] = useState<ClearanceLevel>('C1-DOSSIER-SCRIBE');
  const [msg, setMsg] = useState('');

  const rank = useMemo(
    () => CLEARANCE_RANKS.find((c) => c.id === ops.clearance)?.rank ?? 0,
    [ops.clearance],
  );

  function onElevate() {
    const r = elevateClearance(ops, target, phrase);
    setOps(r.state);
    setMsg(r.ok ? `Clearance elevado a ${target}` : r.error || 'Error');
    if (r.ok) setPhrase('');
  }

  function onMode(mode: OpsMode) {
    const r = setMode(ops, mode);
    setOps(r.state);
    setMsg(r.ok ? `Modo ${mode} activado` : r.error || 'Error');
  }

  return (
    <div className="ops-console">
      <div className="classif-banner">
        FIST278 // hashcod // {PROTOCOL.lattice} // NO-RELEASABLE-TO-C0
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HashcodIcon size={40} />
            <div>
              <p className="kicker">Consola Ω · protocolo operativo</p>
              <h2>Lattice control plane</h2>
            </div>
          </div>
          <p className="subtitle mono" style={{ marginTop: 8, fontSize: '0.82rem' }}>
            {PROTOCOL.passPredicate}
          </p>
        </div>
        <div className="card mono" style={{ fontSize: '0.78rem' }}>
          <div>NONCE {ops.sessionNonce}</div>
          <div>ALIAS {ops.operatorAlias}</div>
          <div>CH {ops.latticeChannel}</div>
          <div>CLR {ops.clearance}</div>
          <div>MODE {ops.mode}</div>
        </div>
      </div>

      {msg && (
        <div className="card" style={{ marginBottom: 12 }}>
          <p className="mono" style={{ margin: 0, fontSize: '0.85rem' }}>
            {msg}
          </p>
        </div>
      )}

      <div className="split" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <h3>Elevación de clearance (C0→C6)</h3>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Sin la frase de elevación correcta, la UI permanece en superficie no privilegiada.
            Las frases constan en el <strong>Manual de Operador PDF</strong>.
          </p>
          <div className="form-group">
            <label>Clearance objetivo</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as ClearanceLevel)}
              className="mono"
            >
              {CLEARANCE_RANKS.map((c) => (
                <option key={c.id} value={c.id}>
                  R{c.rank} · {c.id}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Frase de elevación</label>
            <input
              className="mono"
              type="password"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="off"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={onElevate}>
            ELEVAR_CLR
          </button>
          <div style={{ marginTop: 12 }}>
            {CLEARANCE_RANKS.map((c) => (
              <div
                key={c.id}
                className="mono"
                style={{
                  fontSize: '0.72rem',
                  opacity: c.rank <= rank ? 1 : 0.4,
                  marginBottom: 4,
                }}
              >
                [{c.rank <= rank ? '■' : '□'}] R{c.rank} {c.id} — {c.title}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Modos Ω (requieren clearance)</h3>
          <div className="grid" style={{ gap: 8 }}>
            {OPS_MODES.map((m) => {
              const allowed = rank >= (CLEARANCE_RANKS.find((c) => c.id === m.minClearance)?.rank ?? 99);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`btn ${ops.mode === m.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'flex-start', opacity: allowed ? 1 : 0.35 }}
                  disabled={!allowed}
                  onClick={() => onMode(m.id)}
                >
                  <span className="mono">{m.glyph}</span> {m.id}
                  <span className="muted" style={{ marginLeft: 8, fontSize: '0.75rem' }}>
                    ≥{m.minClearance.split('-')[0]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="muted" style={{ fontSize: '0.8rem', marginBottom: 0, marginTop: 12 }}>
            {OPS_MODES.find((m) => m.id === ops.mode)?.description}
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <h3>Capas semánticas L0–L10</h3>
          <table className="table" style={{ fontSize: '0.8rem' }}>
            <tbody>
              {SEMANTIC_LAYERS.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{l.id}</td>
                  <td>
                    <strong>{l.name}</strong>
                    <div className="muted" style={{ fontSize: '0.75rem' }}>
                      {l.desc}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Pipeline mnemónico α→θ</h3>
          <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.88rem' }}>
            {PIPELINE_MNEMONICS.map((p) => (
              <li key={p.code} style={{ marginBottom: 6 }}>
                <span className="mono">{p.code}</span> — {p.step}
              </li>
            ))}
          </ol>
          <div className="formula mono" style={{ marginTop: 12, fontSize: '0.7rem' }}>
            KEY_MORPH = {PROTOCOL.keyMorphology}
            <br />
            {PROTOCOL.keyExample}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3>Códigos de error F278-E**</h3>
        <div className="grid grid-2">
          {Object.entries(ERROR_CODES).map(([code, text]) => (
            <div key={code} className="mono" style={{ fontSize: '0.78rem' }}>
              <strong>{code}</strong> {text}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Rutas operativas (según modo)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Link className="btn btn-ghost btn-sm" to="/registration">
            Δ 100-F DOSSIER
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/tokenize">
            Φ TOKEN FORGE
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/registry">
            Λ REGISTRY
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/standard">
            Ψ NORM FIST278
          </Link>
          <a className="btn btn-primary btn-sm" href="/docs/FIST278-OPERATOR-MANUAL.pdf" target="_blank" rel="noreferrer">
            MANUAL PDF (AUTORIZADO)
          </a>
        </div>
        <p className="muted" style={{ fontSize: '0.78rem', marginBottom: 0, marginTop: 10 }}>
          Hint C1 (solo en manual PDF completo): las frases de elevación no se muestran aquí a
          propósito. Superficie diseñada para ser ilegible sin el manual.
        </p>
        {/* No mostrar passphrases en UI — solo en PDF */}
        <span style={{ display: 'none' }}>{CLEARANCE_PASSPHRASES['C0-PUBLIC-OBSERVER']}</span>
      </div>
    </div>
  );
}
