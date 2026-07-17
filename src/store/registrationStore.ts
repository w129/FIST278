import type { FormAnswers, RegistrationSession } from '../types/registration';
import { REGISTRATION_FORMS, TOTAL_REGISTRATION_FORMS } from '../data/registrationForms';

const STORAGE_KEY = 'fist278.v1.registration';

function uid(): string {
  return `reg_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function createSession(title = 'Registro de tokenización FIST278'): RegistrationSession {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title,
    createdAt: now,
    updatedAt: now,
    submissions: {},
  };
}

export function loadSession(): RegistrationSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = createSession();
      saveSession(s);
      return s;
    }
    return JSON.parse(raw) as RegistrationSession;
  } catch {
    const s = createSession();
    saveSession(s);
    return s;
  }
}

export function saveSession(session: RegistrationSession): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...session, updatedAt: new Date().toISOString() }),
  );
}

export function resetSession(): RegistrationSession {
  const s = createSession();
  saveSession(s);
  return s;
}

export function saveFormAnswers(
  session: RegistrationSession,
  formId: string,
  answers: FormAnswers,
  markComplete = true,
): RegistrationSession {
  const form = REGISTRATION_FORMS.find((f) => f.id === formId);
  if (!form) return session;

  const requiredOk = form.fields
    .filter((f) => f.required !== false)
    .every((f) => {
      const v = answers[f.id];
      if (typeof v === 'boolean') return true;
      if (typeof v === 'number') return !Number.isNaN(v);
      return String(v ?? '').trim().length > 0;
    });

  const next: RegistrationSession = {
    ...session,
    updatedAt: new Date().toISOString(),
    submissions: {
      ...session.submissions,
      [formId]: {
        formId,
        completed: markComplete ? requiredOk : false,
        answers,
        updatedAt: new Date().toISOString(),
      },
    },
  };
  saveSession(next);
  return next;
}

export function progressOf(session: RegistrationSession): {
  completed: number;
  total: number;
  percent: number;
  missing: string[];
} {
  const total = TOTAL_REGISTRATION_FORMS;
  let completed = 0;
  const missing: string[] = [];
  for (const form of REGISTRATION_FORMS) {
    if (session.submissions[form.id]?.completed) completed += 1;
    else missing.push(form.id);
  }
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    missing,
  };
}

export function exportSessionJson(session: RegistrationSession): string {
  const progress = progressOf(session);
  return JSON.stringify(
    {
      schema: 'fist278.registration.v1',
      standard: 'FIST278',
      authority: 'hashcod',
      progress,
      session,
      formsCatalog: REGISTRATION_FORMS.map((f) => ({
        id: f.id,
        order: f.order,
        area: f.area,
        function: f.function,
        title: f.title,
      })),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

/** Extrae campos útiles para prellenar tokenización */
export function extractTokenizePrefill(session: RegistrationSession): {
  title?: string;
  content?: string;
  description?: string;
  modelId?: string;
  prompt?: string;
  steward?: string;
  licenseIntent?: string;
  tags?: string;
  language?: string;
  hashcodKey?: string;
} {
  const g = (formId: string, field: string) => {
    const v = session.submissions[formId]?.answers[field];
    return v == null ? undefined : String(v);
  };
  return {
    title: g('form_003', 'asset_title'),
    content: g('form_006', 'content_body'),
    description: g('form_003', 'asset_summary'),
    modelId: g('form_004', 'model_id'),
    prompt: g('form_005', 'prompt_text'),
    steward: g('form_007', 'steward_name'),
    licenseIntent: g('form_008', 'license_intent'),
    tags: g('form_022', 'tags'),
    language: g('form_022', 'language') || g('form_005', 'prompt_lang'),
    hashcodKey: g('form_033', 'hashcod_key'),
  };
}
