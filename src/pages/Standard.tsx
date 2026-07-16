import { Award, BadgeCheck, BookMarked, Globe2 } from 'lucide-react';
import { FIST278_STANDARD, HASHCOD, STANDARD_MARK } from '../data/standard';

export function Standard() {
  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Estándar internacional</p>
          <h2>{FIST278_STANDARD.id}</h2>
          <p className="subtitle">{FIST278_STANDARD.fullName}</p>
        </div>
        <div className="card" style={{ maxWidth: 280 }}>
          <div className="stat-label">Publicado por</div>
          <strong style={{ fontSize: '1.15rem' }}>{HASHCOD.org}</strong>
          <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem' }}>
            {HASHCOD.legalName}
            <br />
            v{FIST278_STANDARD.version} · {FIST278_STANDARD.status}
          </p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <Globe2 size={20} color="#000" />
          <h3 style={{ marginTop: 8 }}>Alcance internacional</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {FIST278_STANDARD.classification}
          </p>
        </div>
        <div className="card">
          <Award size={20} color="#000" />
          <h3 style={{ marginTop: 8 }}>Autoridad</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            Solo HashCod emite certificados HVC
          </p>
        </div>
        <div className="card">
          <BadgeCheck size={20} color="#000" />
          <h3 style={{ marginTop: 8 }}>Perfil de certificado</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {FIST278_STANDARD.certificateProfile.profileId}
          </p>
        </div>
        <div className="card">
          <BookMarked size={20} color="#000" />
          <h3 style={{ marginTop: 8 }}>Marca de conformidad</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {STANDARD_MARK}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3>Campo de aplicación</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          {FIST278_STANDARD.scope}
        </p>
        <div className="tag-list">
          {FIST278_STANDARD.domains.map((d) => (
            <span key={d} className="tag">
              {d}
            </span>
          ))}
        </div>
      </div>

      <h3>Requisitos normativos</h3>
      <div className="grid" style={{ gap: '0.65rem', marginBottom: '1.5rem' }}>
        {FIST278_STANDARD.normativeRequirements.map((r, i) => (
          <div key={i} className="card" style={{ padding: '0.85rem 1rem' }}>
            <strong className="mono" style={{ fontSize: '0.8rem' }}>
              REQ-{i + 1}
            </strong>
            <p className="muted" style={{ margin: '0.35rem 0 0' }}>
              {r}
            </p>
          </div>
        ))}
      </div>

      <h3>Cláusulas</h3>
      <div className="grid" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
        {FIST278_STANDARD.clauses.map((c) => (
          <div key={c.id} className="card">
            <div className="codename">{c.id}</div>
            <h3 style={{ marginTop: 4 }}>{c.title}</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              {c.body}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Certificado HashCod de Validación (HVC)</h3>
        <p className="muted">
          Para que un token alcance <strong>decision = pass</strong> bajo FIST278, debe poseer un
          certificado emitido por <strong>HashCod</strong> que:
        </p>
        <ul className="muted" style={{ marginTop: 0 }}>
          <li>Identifique emisor HashCod y estándar FIST278</li>
          <li>Vincule tokenSerial + contentHash + commitmentHash</li>
          <li>Porte firma verificable de la autoridad HashCod</li>
          <li>Esté vigente (no expirado ni revocado)</li>
        </ul>
        <div className="formula mono">
          HVC = Sign_HashCod( payload(serial, commitment, content, subject, validity) )
        </div>
        <p className="muted" style={{ marginBottom: 0, fontSize: '0.85rem' }}>
          Emisión: en el detalle del token → «Emitir Certificado HashCod». Luego ejecuta la
          validación con aprobación humana.
        </p>
      </div>
    </div>
  );
}
