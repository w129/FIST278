/**
 * Primitivas criptográficas del núcleo de tokenización.
 * SHA-256 vía Web Crypto; fallback determinista si no hay subtle.
 */

/** Fallback no criptográfico (entornos sin Web Crypto) */
function fallbackHash(text: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0xdeadbeef;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c + ((i * 131) & 0xff);
    h2 = Math.imul(h2, 0x01000193) ^ (h1 >>> 16);
  }
  let out =
    (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  for (let i = 0; i < 6; i++) {
    h1 = Math.imul(h1 ^ h2, 0x85ebca6b);
    h2 = Math.imul(h2 ^ h1, 0xc2b2ae35);
    out += (h1 >>> 0).toString(16).padStart(8, '0');
  }
  return out.slice(0, 64);
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  if (globalThis.crypto?.subtle) {
    const dig = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(dig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return fallbackHash(text);
}

export function fingerprintFromHash(hash: string, len = 12): string {
  return hash.slice(0, len).toUpperCase();
}

export function canonicalizeContent(content: string): string {
  return content.replace(/\r\n/g, '\n').trimEnd() + '\n';
}

export function buildMetadataEnvelope(meta: Record<string, unknown>): string {
  const keys = Object.keys(meta).sort();
  const ordered: Record<string, unknown> = {};
  for (const k of keys) ordered[k] = meta[k];
  return JSON.stringify(ordered);
}

export async function commitmentHash(
  contentHash: string,
  metadataHash: string,
  serial: string,
): Promise<string> {
  return sha256Hex(`${contentHash}|${metadataHash}|${serial}|FIST278-v1`);
}

export async function sealHash(
  commitment: string,
  algorithm: string,
  timestamp: string,
): Promise<string> {
  return sha256Hex(`PQC-SEAL|${algorithm}|${commitment}|${timestamp}`);
}
