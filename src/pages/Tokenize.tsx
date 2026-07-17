import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import { useTokens } from '../context/TokenContext';
import type { AiAssetKind } from '../types/token';

const KINDS: { value: AiAssetKind; label: string }[] = [
  { value: 'text', label: 'Texto / documento' },
  { value: 'code', label: 'Código' },
  { value: 'protocol', label: 'Protocolo' },
  { value: 'invention-disclosure', label: 'Disclosure de invención' },
  { value: 'design', label: 'Diseño' },
  { value: 'dataset', label: 'Dataset (desc.)' },
  { value: 'model-weights-desc', label: 'Descripción de modelo' },
  { value: 'multimedia-desc', label: 'Multimedia (desc.)' },
  { value: 'other', label: 'Otro' },
];

export function Tokenize() {
  const { tokenize, stats } = useTokens();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<AiAssetKind>('text');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [modelId, setModelId] = useState('grok-4');
  const [prompt, setPrompt] = useState('');
  const [steward, setSteward] = useState('');
  const [licenseIntent, setLicenseIntent] =
    useState<'proprietary' | 'open' | 'dual' | 'undecided'>('undecided');
  const [tags, setTags] = useState('IA, generado');
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    const g = (k: string) => searchParams.get(k);
    if (g('title')) setTitle(g('title')!);
    if (g('content')) setContent(g('content')!);
    if (g('description')) setDescription(g('description')!);
    if (g('modelId')) setModelId(g('modelId')!);
    if (g('prompt')) setPrompt(g('prompt')!);
    if (g('steward')) setSteward(g('steward')!);
    if (g('tags')) setTags(g('tags')!);
    if (g('language')) setLanguage(g('language')!);
    const lic = g('licenseIntent');
    if (lic === 'proprietary' || lic === 'open' || lic === 'dual' || lic === 'undecided') {
      setLicenseIntent(lic);
    }
  }, [searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!content.trim() || content.trim().length < 20) {
      setError('El contenido del activo debe tener al menos 20 caracteres.');
      return;
    }
    setBusy(true);
    try {
      const token = await tokenize({
        title: title.trim() || 'Activo IA sin título',
        kind,
        content,
        description,
        modelId,
        prompt,
        steward,
        licenseIntent,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        language,
      });
      navigate(`/tokens/${token.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al tokenizar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">FIST278 · hashcod</p>
          <h2>Tokenizar activos generados por IA</h2>
          <p className="subtitle">
            Pega el output de un modelo y genera un token bajo el estándar internacional FIST278
            (hashcod). Completa antes los <strong>100 formularios</strong> de registro si quieres
            un dossier completo. Luego certificado hashcod y validación.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="card" style={{ minWidth: 200, padding: '0.85rem 1rem' }}>
            <div className="stat-label">Registro tokens</div>
            <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {stats.total} tokens · {stats.validated} validados
            </div>
          </div>
          <Link to="/registration" className="btn btn-ghost btn-sm">
            <ClipboardList size={14} /> 100 formularios de registro
          </Link>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <Sparkles size={18} color="#000000" />
          <h3 style={{ marginTop: 8 }}>1. Activo IA</h3>
          <p className="muted" style={{ margin: 0 }}>
            Contenido + modelo + prompt + steward
          </p>
        </div>
        <div className="card">
          <Coins size={18} color="#000000" />
          <h3 style={{ marginTop: 8 }}>2. Tokenizar</h3>
          <p className="muted" style={{ margin: 0 }}>
            Hashes, serial FST-YEAR-####, features
          </p>
        </div>
        <div className="card">
          <ShieldCheck size={18} color="#000000" />
          <h3 style={{ marginTop: 8 }}>3. Certificar & validar</h3>
          <p className="muted" style={{ margin: 0 }}>
            HVC hashcod · 10 gates · pass solo con certificado
          </p>
        </div>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <div className="split">
          <div>
            <div className="form-group">
              <label htmlFor="title">Título del activo</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Módulo de attestation para outputs LLM"
              />
            </div>
            <div className="form-group">
              <label htmlFor="kind">Tipo</label>
              <select id="kind" value={kind} onChange={(e) => setKind(e.target.value as AiAssetKind)}>
                {KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="content">Contenido generado por IA *</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Pega aquí el texto, código o disclosure generado por el modelo…"
                style={{ minHeight: 220 }}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción / abstract</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Resumen del valor del activo"
              />
            </div>
          </div>

          <div>
            <div className="form-group">
              <label htmlFor="model">Modelo generador</label>
              <input
                id="model"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="grok-4, gpt-4o, claude, local-llm…"
                className="mono"
              />
            </div>
            <div className="form-group">
              <label htmlFor="prompt">Prompt de generación (se hashea, no es secreto del sistema)</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Prompt usado para generar el activo"
                style={{ minHeight: 100 }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="steward">Steward / responsable humano</label>
              <input
                id="steward"
                value={steward}
                onChange={(e) => setSteward(e.target.value)}
                placeholder="Nombre o equipo"
              />
            </div>
            <div className="form-group">
              <label htmlFor="license">Intención de licencia</label>
              <select
                id="license"
                value={licenseIntent}
                onChange={(e) =>
                  setLicenseIntent(e.target.value as typeof licenseIntent)
                }
              >
                <option value="undecided">Por decidir</option>
                <option value="proprietary">Propietaria</option>
                <option value="open">Abierta</option>
                <option value="dual">Dual</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="lang">Idioma</label>
              <input id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>

            <div className="card" style={{ background: 'var(--bg)', marginBottom: 12 }}>
              <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
                <strong>Commitment:</strong> H(contentHash ‖ metadataHash ‖ serial ‖ domain)
                <br />
                El contenido se canonicaliza (LF) antes del SHA-256.
              </p>
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
              <Coins size={18} />
              {busy ? 'Tokenizando…' : 'Tokenizar activo IA'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
