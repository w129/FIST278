import type { PQCAlgorithm } from '../types';

/** Catálogo de referencia post-cuántica (NIST FIPS y ecosistema) */
export const PQC_ALGORITHMS: PQCAlgorithm[] = [
  {
    id: 'ml-kem',
    name: 'ML-KEM (Kyber)',
    family: 'Module-LWE / lattices',
    nistStatus: 'FIPS 203',
    role: 'KEM',
    securityLevel: 'ML-KEM-512/768/1024 ≈ AES-128/192/256',
    sizeNotes: 'Ciphertexts y claves públicas más grandes que ECDH; 768 es el default recomendado.',
    useCases: [
      'TLS / QUIC key exchange',
      'VPN y zero-trust tunnels',
      'Cifrado de datos en reposo (KEK wrapping)',
      'Protocolos de mensajería',
    ],
    migrationTips: [
      'Usar modo híbrido X25519 + ML-KEM-768 en transición',
      'Probar handshake size en middleboxes y CDNs',
      'Planificar rotación de certificados y claves de largo plazo',
    ],
  },
  {
    id: 'ml-dsa',
    name: 'ML-DSA (Dilithium)',
    family: 'Module-LWE / lattices',
    nistStatus: 'FIPS 204',
    role: 'Signature',
    securityLevel: 'ML-DSA-44/65/87',
    sizeNotes: 'Firmas ~2–3 KB; claves públicas ~1–2 KB. Preferido general-purpose.',
    useCases: [
      'Firmas de software y SBOM',
      'Certificados X.509 / PKI',
      'Tokens y autenticación',
      'Contratos y sellado de tiempo',
    ],
    migrationTips: [
      'Priorizar roots y code-signing de larga vida',
      'Evaluar tamaño en firmware embebido',
      'Mantener dual-signature durante transición',
    ],
  },
  {
    id: 'slh-dsa',
    name: 'SLH-DSA (SPHINCS+)',
    family: 'Hash-based',
    nistStatus: 'FIPS 205',
    role: 'Signature',
    securityLevel: 'Variantes 128/192/256 bit (small/fast)',
    sizeNotes: 'Firmas grandes (8–50 KB). Conservador: seguridad basada en hashes.',
    useCases: [
      'Root of trust de muy largo plazo',
      'Firmware firmado donde el tamaño es aceptable',
      'Diversificación algorítmica (no-lattice)',
    ],
    migrationTips: [
      'Reservar para roots y casos high-assurance',
      'No usar como default de alta frecuencia sin medir latencia',
      'Combinar con ML-DSA en esquemas multi-firma',
    ],
  },
  {
    id: 'fn-dsa',
    name: 'FN-DSA (Falcon) — en proceso',
    family: 'NTRU lattices',
    nistStatus: 'Selección NIST / estandarización en curso',
    role: 'Signature',
    securityLevel: 'Falcon-512/1024',
    sizeNotes: 'Firmas compactas; implementación floating-point delicada.',
    useCases: [
      'Entornos con presupuesto de bytes ajustado',
      'Certificados de tamaño crítico',
    ],
    migrationTips: [
      'Usar implementaciones auditadas (evitar side-channels)',
      'Evaluar vs. ML-DSA por madurez de libs',
    ],
  },
  {
    id: 'aes',
    name: 'AES-256 (simétrico)',
    family: 'Symmetric block cipher',
    nistStatus: 'FIPS 197 (sigue siendo post-quantum-safe a 256-bit)',
    role: 'Symmetric',
    securityLevel: 'AES-256 ≈ seguridad post-cuántica razonable (Grover)',
    sizeNotes: 'Sin cambio de tamaño; clave 256-bit recomendada.',
    useCases: [
      'Cifrado de datos en tránsito y reposo',
      'Disk encryption',
      'AEAD (AES-GCM, AES-GCM-SIV)',
    ],
    migrationTips: [
      'Migrar de AES-128 a AES-256 donde haya datos de larga vida',
      'Combinar con KEM PQC para wrapping de claves',
    ],
  },
  {
    id: 'sha3',
    name: 'SHA-3 / SHAKE',
    family: 'Keccak hash',
    nistStatus: 'FIPS 202',
    role: 'Hash',
    securityLevel: 'SHA3-256/512; SHAKE128/256',
    sizeNotes: 'XOF útil para derivación y PQC.',
    useCases: [
      'Hashing de integridad',
      'KDF y expanders en esquemas PQC',
      'Commitments y Merkle trees',
    ],
    migrationTips: [
      'Preferir SHA-3/SHAKE en diseños nuevos PQC',
      'Documentar dominio de separación en hashes',
    ],
  },
];

export const MIGRATION_PHASES = [
  {
    id: 'p0',
    name: 'Fase 0 — Conciencia',
    horizon: 'Inmediato',
    actions: [
      'Formar equipo crypto-agility',
      'Educar a liderazgo sobre HNDL (Harvest Now, Decrypt Later)',
      'Clasificar datos por vida útil de confidencialidad',
    ],
  },
  {
    id: 'p1',
    name: 'Fase 1 — Inventario',
    horizon: '0–3 meses',
    actions: [
      'Inventariar RSA, ECC, DH, certificados y HSMs',
      'Mapear protocolos (TLS, SSH, VPN, JWT, firmas de código)',
      'Identificar dependencias de terceros y SaaS',
    ],
  },
  {
    id: 'p2',
    name: 'Fase 2 — Priorización',
    horizon: '1–6 meses',
    actions: [
      'Priorizar sistemas con datos de larga vida (>10 años)',
      'Marcar roots de confianza y code-signing',
      'Definir stack objetivo (ML-KEM + ML-DSA + AES-256)',
    ],
  },
  {
    id: 'p3',
    name: 'Fase 3 — Pilotos híbridos',
    horizon: '3–12 meses',
    actions: [
      'Desplegar hybrid KEM en TLS de no-producción',
      'Probar tamaños de handshake y certificados',
      'Validar con middleboxes, IoT y clientes legacy',
    ],
  },
  {
    id: 'p4',
    name: 'Fase 4 — Producción',
    horizon: '6–24 meses',
    actions: [
      'Rollout gradual con feature flags',
      'Actualizar PKI y procesos de emisión',
      'Monitorear rendimiento y fallos de interoperabilidad',
    ],
  },
  {
    id: 'p5',
    name: 'Fase 5 — Gobernanza',
    horizon: 'Continuo',
    actions: [
      'Crypto-agility: poder cambiar algoritmos sin rediseño',
      'Auditorías periódicas y threat modeling',
      'Retiro controlado de crypto clásica vulnerable',
    ],
  },
];

export const HNDL_PRINCIPLES = [
  {
    title: 'Harvest Now, Decrypt Later',
    body: 'Un adversario puede grabar tráfico cifrado hoy y descifrarlo cuando existan computadoras cuánticas criptográficamente relevantes (CRQC). Datos de larga vida requieren PQC ya.',
  },
  {
    title: 'Crypto-agility',
    body: 'Diseña protocolos y productos para intercambiar algoritmos sin reescritura mayor. Evita hardcodear RSA/ECC.',
  },
  {
    title: 'Híbrido primero',
    body: 'Durante la transición, combina clásico + PQC. La seguridad es al menos la del más fuerte si se compone correctamente.',
  },
  {
    title: 'Inventario antes de migrar',
    body: 'No se puede proteger lo que no se conoce. El inventario crypto es el primer entregable de cualquier programa PQC.',
  },
];

export const DEFAULT_PQC_OPTIONS = {
  kems: ['ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024', 'Híbrido X25519+ML-KEM-768', 'Otro'],
  signatures: ['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87', 'SLH-DSA', 'Híbrido ECDSA+ML-DSA', 'Otro'],
  hashes: ['SHA3-256', 'SHA3-512', 'SHAKE256', 'SHA-256', 'SHA-384'],
};
