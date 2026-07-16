/**
 * Claves HashCod — formato obligatorio para validar en la plataforma FIST278.
 *
 * Formato canónico:
 *   > |||||------|---|-|-|-|||----||||...| <
 *
 * Delimitadores: "> " al inicio y " <" al final.
 * Cuerpo: solo caracteres '|' y '-'.
 *
 * Ejemplo de referencia:
 *   > |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <
 */

/** Ejemplo normativo de clave HashCod (documentación / plantilla) */
export const HASHCOD_KEY_EXAMPLE =
  '> |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <';

/**
 * Regex de una clave HashCod completa.
 * Permite espacios opcionales alrededor de los delimitadores > y <.
 */
export const HASHCOD_KEY_REGEX = />\s([|\-]+)\s</g;

/** Regex ancla (clave exacta en string completo) */
export const HASHCOD_KEY_FULL = /^>\s[|\-]+\s<$/;

export type HashCodKeyParse = {
  ok: boolean;
  key: string;
  body: string;
  pipeCount: number;
  dashCount: number;
  length: number;
  error?: string;
};

/**
 * Normaliza una clave: trim y espacios simples alrededor de delimitadores.
 */
export function normalizeHashCodKey(raw: string): string {
  const t = raw.trim();
  // Si ya tiene forma > body <
  const m = t.match(/^>\s*([|\-]+)\s*<$/);
  if (m) return `> ${m[1]} <`;
  return t;
}

/**
 * Valida formato de clave HashCod.
 * Para validar en la plataforma el valor DEBE ser de la forma:
 *   > |…|-…| <
 */
export function parseHashCodKey(raw: string | undefined | null): HashCodKeyParse {
  if (!raw || !raw.trim()) {
    return {
      ok: false,
      key: '',
      body: '',
      pipeCount: 0,
      dashCount: 0,
      length: 0,
      error: 'Falta clave HashCod. Formato: > |||||------|---|-|…| <',
    };
  }
  const key = normalizeHashCodKey(raw);
  if (!HASHCOD_KEY_FULL.test(key)) {
    return {
      ok: false,
      key,
      body: '',
      pipeCount: 0,
      dashCount: 0,
      length: 0,
      error:
        'Clave HashCod inválida. Debe ser exactamente: > [solo | y -] <  (ej. > |||||------|---|-|-|-|||----||||…| <)',
    };
  }
  const body = key.slice(2, -2).trim(); // strip "> " and " <"
  if (body.length < 16) {
    return {
      ok: false,
      key,
      body,
      pipeCount: 0,
      dashCount: 0,
      length: body.length,
      error: 'Clave HashCod demasiado corta (mín. 16 símbolos |/-).',
    };
  }
  if (!body.includes('|') || !body.includes('-')) {
    return {
      ok: false,
      key,
      body,
      pipeCount: (body.match(/\|/g) ?? []).length,
      dashCount: (body.match(/-/g) ?? []).length,
      length: body.length,
      error: 'La clave debe combinar ambos símbolos | y -.',
    };
  }
  return {
    ok: true,
    key,
    body,
    pipeCount: (body.match(/\|/g) ?? []).length,
    dashCount: (body.match(/-/g) ?? []).length,
    length: body.length,
  };
}

/** Extrae la primera clave HashCod embebida en un texto o JSON */
export function extractHashCodKeyFromText(text: string): string | null {
  const re = />\s[|\-]+\s</g;
  const m = text.match(re);
  if (!m?.[0]) return null;
  return normalizeHashCodKey(m[0]);
}

/** Extrae todas las claves del texto */
export function extractAllHashCodKeys(text: string): string[] {
  const re = />\s[|\-]+\s</g;
  const found = text.match(re) ?? [];
  return [...new Set(found.map(normalizeHashCodKey))];
}

/**
 * Codifica un hex (hash) a cuerpo de clave HashCod (solo | y -).
 * bit 1 → |  bit 0 → -
 */
export function hexToKeyBody(hex: string, minLen = 64): string {
  const h = hex.replace(/[^0-9a-f]/gi, '').toLowerCase();
  let bits = '';
  for (const ch of h) {
    const n = parseInt(ch, 16);
    bits += n.toString(2).padStart(4, '0');
  }
  let body = bits
    .split('')
    .map((b) => (b === '1' ? '|' : '-'))
    .join('');
  while (body.length < minLen) {
    body += body.slice(0, Math.min(16, minLen - body.length));
  }
  return body.slice(0, Math.max(minLen, Math.min(body.length, 128)));
}

/** Construye clave completa a partir de body */
export function wrapHashCodKey(body: string): string {
  const clean = body.replace(/[^|-]/g, '');
  return `> ${clean} <`;
}

/**
 * Genera una clave HashCod determinista a partir de commitment + content hash.
 * (Emisión local; el formato es el mismo que exige la validación por subida.)
 */
export function deriveHashCodKey(commitmentHash: string, contentHash: string): string {
  const material = `${commitmentHash}${contentHash}HASHCOD-KEY`;
  // simple expand without async: use char codes → pseudo hex
  let hex = '';
  for (let i = 0; i < material.length; i++) {
    hex += (material.charCodeAt(i) & 0xff).toString(16).padStart(2, '0');
  }
  // mix
  let acc = 0;
  for (let i = 0; i < hex.length; i++) acc = (acc * 31 + hex.charCodeAt(i)) >>> 0;
  hex += acc.toString(16).padStart(8, '0');
  return wrapHashCodKey(hexToKeyBody(hex, 80));
}

/**
 * Parsea un archivo de certificado subido (JSON o texto plano).
 * Debe presentar al menos una clave HashCod en el formato > |…| <
 */
export function parseUploadedCertificate(raw: string): {
  ok: boolean;
  hashcodKey: string | null;
  allKeys: string[];
  meta: Partial<{
    certSerial: string;
    subject: string;
    issuer: string;
    tokenSerial: string;
    commitmentHash: string;
    contentHash: string;
    issuedAt: string;
    expiresAt: string;
    signature: string;
  }>;
  error?: string;
} {
  const text = raw.trim();
  if (!text) {
    return {
      ok: false,
      hashcodKey: null,
      allKeys: [],
      meta: {},
      error: 'Archivo o texto vacío.',
    };
  }

  const allKeys = extractAllHashCodKeys(text);
  let hashcodKey: string | null = allKeys[0] ?? null;
  const meta: ReturnType<typeof parseUploadedCertificate>['meta'] = {};

  // Intentar JSON
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    if (typeof j.hashcodKey === 'string') {
      hashcodKey = normalizeHashCodKey(j.hashcodKey);
    } else if (typeof j.key === 'string') {
      hashcodKey = normalizeHashCodKey(j.key);
    } else if (typeof j.hashcod_key === 'string') {
      hashcodKey = normalizeHashCodKey(j.hashcod_key);
    }
    if (!hashcodKey && typeof j.body === 'string') {
      hashcodKey = wrapHashCodKey(String(j.body).replace(/[^|-]/g, ''));
    }
    // re-extract from full json string if nested
    if (!hashcodKey) {
      const embedded = extractHashCodKeyFromText(text);
      if (embedded) hashcodKey = embedded;
    }
    for (const k of [
      'certSerial',
      'subject',
      'issuer',
      'tokenSerial',
      'commitmentHash',
      'contentHash',
      'issuedAt',
      'expiresAt',
      'signature',
    ] as const) {
      if (typeof j[k] === 'string') meta[k] = j[k] as string;
    }
  } catch {
    // texto plano: solo clave o multi-línea
    if (!hashcodKey) {
      hashcodKey = extractHashCodKeyFromText(text);
    }
  }

  if (!hashcodKey) {
    return {
      ok: false,
      hashcodKey: null,
      allKeys,
      meta,
      error: `No se encontró clave HashCod. Debe presentar un valor como:\n${HASHCOD_KEY_EXAMPLE}`,
    };
  }

  const parsed = parseHashCodKey(hashcodKey);
  if (!parsed.ok) {
    return {
      ok: false,
      hashcodKey,
      allKeys,
      meta,
      error: parsed.error,
    };
  }

  return {
    ok: true,
    hashcodKey: parsed.key,
    allKeys: allKeys.length ? allKeys : [parsed.key],
    meta,
  };
}

export function isValidHashCodKey(raw: string | undefined | null): boolean {
  return parseHashCodKey(raw).ok;
}
