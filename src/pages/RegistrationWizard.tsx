import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  REGISTRATION_FORMS,
  TOTAL_REGISTRATION_FORMS,
} from '../data/registrationForms';
import type { FormAnswers, RegistrationSession } from '../types/registration';
import {
  exportSessionJson,
  extractTokenizePrefill,
  loadSession,
  progressOf,
  resetSession,
  saveFormAnswers,
} from '../store/registrationStore';

export function RegistrationWizard() {
  const [session, setSession] = useState<RegistrationSession>(() => loadSession());
  const [order, setOrder] = useState(1);
  const [filter, setFilter] = useState('');
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [msg, setMsg] = useState('');

  const form = useMemo(
    () => REGISTRATION_FORMS.find((f) => f.order === order) ?? REGISTRATION_FORMS[0],
    [order],
  );

  const progress = useMemo(() => progressOf(session), [session]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return REGISTRATION_FORMS;
    return REGISTRATION_FORMS.filter(
      (f) =>
        f.area.toLowerCase().includes(q) ||
        f.function.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        String(f.order).includes(q),
    );
  }, [filter]);

  useEffect(() => {
    const sub = session.submissions[form.id];
    setAnswers(sub?.answers ?? {});
    setMsg('');
  }, [form.id, session.submissions]);

  function setField(id: string, value: string | number | boolean) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function onSave(andNext = false) {
    const next = saveFormAnswers(session, form.id, answers, true);
    setSession(next);
    const ok = next.submissions[form.id]?.completed;
    setMsg(
      ok
        ? `Formulario ${form.order} guardado y marcado completo.`
        : `Formulario ${form.order} guardado (faltan campos obligatorios).`,
    );
    if (andNext && form.order < TOTAL_REGISTRATION_FORMS) {
      setOrder(form.order + 1);
    }
  }

  function onReset() {
    if (!confirm('¿Reiniciar todo el registro de 100 formularios?')) return;
    setSession(resetSession());
    setOrder(1);
    setAnswers({});
    setMsg('Registro reiniciado.');
  }

  function onExport() {
    const blob = new Blob([exportSessionJson(session)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fist278-registration-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const prefill = extractTokenizePrefill(session);
  const tokenizeQs = new URLSearchParams();
  if (prefill.title) tokenizeQs.set('title', prefill.title);
  if (prefill.content) tokenizeQs.set('content', prefill.content.slice(0, 8000));
  if (prefill.description) tokenizeQs.set('description', prefill.description);
  if (prefill.modelId) tokenizeQs.set('modelId', prefill.modelId);
  if (prefill.prompt) tokenizeQs.set('prompt', prefill.prompt.slice(0, 4000));
  if (prefill.steward) tokenizeQs.set('steward', prefill.steward);
  if (prefill.licenseIntent) tokenizeQs.set('licenseIntent', prefill.licenseIntent);
  if (prefill.tags) tokenizeQs.set('tags', prefill.tags);
  if (prefill.language) tokenizeQs.set('language', prefill.language);
  if (prefill.hashcodKey) tokenizeQs.set('hashcodKey', prefill.hashcodKey);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Registro de tokenización · 100 formularios</p>
          <h2>Dossier FIST278 / hashcod</h2>
          <p className="subtitle">
            Completa los <strong>{TOTAL_REGISTRATION_FORMS}</strong> formularios. Cada uno cubre
            un <strong>área</strong> distinta y cumple una <strong>función</strong> distinta del
            registro de tokenización.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>
            {progress.percent}%
          </div>
          <div className="stat-label">
            {progress.completed}/{progress.total} completos
          </div>
          <div className="progress-bar" style={{ width: 160 }}>
            <span style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <div className="stat-label">Total formularios</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {TOTAL_REGISTRATION_FORMS}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Completados</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {progress.completed}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {progress.total - progress.completed}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Formulario actual</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            #{form.order}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onExport}>
          <Download size={14} /> Exportar dossier JSON
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          <RotateCcw size={14} /> Reiniciar registro
        </button>
        <Link
          to={`/tokenize?${tokenizeQs.toString()}`}
          className="btn btn-primary btn-sm"
          title="Usa datos del dossier para prellenar tokenización"
        >
          Ir a tokenizar (con prefill)
        </Link>
      </div>

      {msg && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0 }}>{msg}</p>
        </div>
      )}

      <div className="reg-layout">
        {/* Lista de 100 */}
        <aside className="card reg-list">
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label>
              <Search size={14} style={{ verticalAlign: 'middle' }} /> Buscar área / función
            </label>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="ej. PQC, KYC, prompt…"
            />
          </div>
          <div className="reg-list-scroll">
            {filtered.map((f) => {
              const done = session.submissions[f.id]?.completed;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`reg-list-item ${f.order === order ? 'active' : ''} ${done ? 'done' : ''}`}
                  onClick={() => setOrder(f.order)}
                >
                  <span className="mono reg-num">{f.order}</span>
                  <span className="reg-list-text">
                    <strong>{f.area}</strong>
                    <small>{f.title}</small>
                  </span>
                  {done && <CheckCircle2 size={14} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Formulario activo */}
        <section className="card reg-form">
          <div className="codename">
            Formulario {form.order} / {TOTAL_REGISTRATION_FORMS} · {form.id}
          </div>
          <h3 style={{ margin: '0.35rem 0' }}>{form.title}</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            {form.description}
          </p>

          <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
            <div className="card" style={{ padding: '0.75rem' }}>
              <div className="stat-label">Área</div>
              <strong>{form.area}</strong>
            </div>
            <div className="card" style={{ padding: '0.75rem' }}>
              <div className="stat-label">Función</div>
              <strong style={{ fontSize: '0.92rem' }}>{form.function}</strong>
            </div>
          </div>

          {form.fields.map((field) => (
            <div key={field.id} className="form-group">
              <label htmlFor={field.id}>
                {field.label}
                {field.required !== false ? ' *' : ''}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.id}
                  value={String(answers[field.id] ?? '')}
                  onChange={(e) => setField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.id}
                  value={String(answers[field.id] ?? '')}
                  onChange={(e) => setField(field.id, e.target.value)}
                >
                  <option value="">— seleccionar —</option>
                  {(field.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id={field.id}
                    type="checkbox"
                    checked={Boolean(answers[field.id])}
                    onChange={(e) => setField(field.id, e.target.checked)}
                  />
                  {field.help || 'Sí'}
                </label>
              ) : (
                <input
                  id={field.id}
                  type={field.type === 'number' ? 'number' : field.type}
                  value={
                    answers[field.id] === undefined || answers[field.id] === null
                      ? ''
                      : String(answers[field.id])
                  }
                  onChange={(e) =>
                    setField(
                      field.id,
                      field.type === 'number' ? Number(e.target.value) : e.target.value,
                    )
                  }
                  placeholder={field.placeholder}
                />
              )}
              {field.help && field.type !== 'checkbox' && (
                <span className="muted" style={{ fontSize: '0.78rem' }}>
                  {field.help}
                </span>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={form.order <= 1}
              onClick={() => setOrder((o) => Math.max(1, o - 1))}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onSave(false)}>
              <ClipboardList size={16} /> Guardar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onSave(true)}>
              Guardar y siguiente <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={form.order >= TOTAL_REGISTRATION_FORMS}
              onClick={() => setOrder((o) => Math.min(TOTAL_REGISTRATION_FORMS, o + 1))}
            >
              Saltar <ChevronRight size={16} />
            </button>
          </div>

          {progress.percent === 100 && (
            <div className="card" style={{ marginTop: '1.25rem', borderWidth: 3 }}>
              <h3 style={{ marginTop: 0 }}>Dossier completo</h3>
              <p className="muted">
                Los 100 formularios están completos. Puedes exportar el JSON o continuar a
                tokenización con datos prellenados.
              </p>
              <Link to={`/tokenize?${tokenizeQs.toString()}`} className="btn btn-primary">
                Tokenizar con datos del registro
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
