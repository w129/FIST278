import { Award, BadgeCheck, BookMarked, Globe2 } from 'lucide-react';
import { FIST278_STANDARD, HASHCOD, STANDARD_MARK } from '../data/standard';
import { HashcodIcon } from '../components/HashcodIcon';

export function Standard() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <HashcodIcon size={42} variant="black" />
            <p className="kicker" style={{ margin: 0 }}>
              Estándar internacional · hashcod
            </p>
          </div>
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
            Solo hashcod emite certificados HVC
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
        <h3>Certificado hashcod de Validación (HVC) + clave</h3>
        <p className="muted">
          El certificado <strong>debe subirse</strong> a la plataforma y presentar una{' '}
          <strong>clave hashcod</strong> con este formato exacto (solo <code>|</code> y{' '}
          <code>-</code>):
        </p>
        <div className="formula mono" style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>
          {`> |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <`}
        </div>
        <p className="muted">
          Para que un token alcance <strong>decision = pass</strong> bajo FIST278:
        </p>
        <ul className="muted" style={{ marginTop: 0 }}>
          <li>Certificado subido con clave en formato &gt; |…|-…| &lt;</li>
          <li>Emisor hashcod / estándar FIST278</li>
          <li>Vínculo a token (serial / hashes) cuando se declare</li>
          <li>Vigente (no expirado ni revocado)</li>
          <li>Revisión humana marcada al validar</li>
        </ul>
        <div className="formula mono">
          Pass ⇔ clave_hashcod_formato_OK ∧ HVC ∧ integridad ∧ human
        </div>
        <p className="muted" style={{ marginBottom: 0, fontSize: '0.85rem' }}>
          Flujo: detalle del token → pegar/subir clave o archivo → «Subir certificado hashcod» →
          validar. (La lógica interna del sistema de claves se ampliará según especificación
          hashcod.)
        </p>
      </div>
    </div>
  );
}
