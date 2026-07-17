/**
 * Genera docs/FIST278-OPERATOR-MANUAL.pdf
 * Manual de operador autorizado — hashcod / FIST278
 */
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'docs');
const outFile = path.join(outDir, 'FIST278-OPERATOR-MANUAL.pdf');

fs.mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 56, bottom: 56, left: 56, right: 56 },
  info: {
    Title: 'FIST278 Operator Manual — hashcod',
    Author: 'hashcod',
    Subject: 'Manual de operador autorizado FIST278',
    Keywords: 'FIST278,hashcod,HVC,tokenizacion,operador',
  },
});

const stream = fs.createWriteStream(outFile);
doc.pipe(stream);

const pageW = doc.page.width - 112;

function banner(text) {
  doc.rect(56, doc.y, pageW, 22).fill('#000000');
  doc.fillColor('#FFFFFF').font('Courier-Bold').fontSize(8).text(text, 62, doc.y - 16, {
    width: pageW - 12,
  });
  doc.fillColor('#000000');
  doc.moveDown(1.2);
}

function h1(t) {
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(16).text(t);
  doc.moveDown(0.3);
}

function h2(t) {
  doc.moveDown(0.35);
  doc.font('Helvetica-Bold').fontSize(12).text(t);
  doc.moveDown(0.2);
}

function p(t) {
  doc.font('Helvetica').fontSize(10).fillColor('#000000').text(t, { align: 'justify' });
  doc.moveDown(0.35);
}

function mono(t) {
  doc.font('Courier').fontSize(8.5).text(t, { align: 'left' });
  doc.moveDown(0.3);
}

function bullet(items) {
  doc.font('Helvetica').fontSize(10);
  for (const it of items) {
    doc.text(`•  ${it}`, { indent: 8 });
  }
  doc.moveDown(0.35);
}

// —— PORTADA ——
banner('FIST278 // hashcod // OPERATOR MANUAL // CONTROLLED DISTRIBUTION');
doc.moveDown(2);
doc.font('Helvetica-Bold').fontSize(22).text('FIST278', { align: 'center' });
doc.moveDown(0.3);
doc.font('Helvetica-Bold').fontSize(14).text('Manual de Operador Autorizado', {
  align: 'center',
});
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(11).text('Framework for International Standardization of Tokenized AI Assets', {
  align: 'center',
});
doc.moveDown(0.3);
doc.font('Courier').fontSize(10).text('Autoridad: hashcod', { align: 'center' });
doc.text('Lattice: HVC-LATTICE/Ω-4.2', { align: 'center' });
doc.text('Versión del manual: 1.0.0', { align: 'center' });
doc.moveDown(1);
doc.font('Helvetica-Oblique').fontSize(9).text(
  'Este documento es la única fuente legible del protocolo operativo. La interfaz de la plataforma es deliberadamente densa. Sin este manual, un operador no autorizado no puede elevar clearance ni completar Π_pass.',
  { align: 'center' },
);
doc.moveDown(2);
doc.font('Helvetica').fontSize(9).text(`Generado: ${new Date().toISOString()}`, {
  align: 'center',
});

// —— 1. PROPÓSITO ——
doc.addPage();
banner('SECCIÓN 1 — PROPÓSITO Y ALCANCE');
h1('1. Qué es FIST278');
p(
  'FIST278 es el estándar internacional de hashcod para tokenizar y validar activos generados por inteligencia artificial. La plataforma implementa el estándar como un plano de control multi-capa: dossier de 100 formularios, forja de tokens criptográficos, certificado HVC con clave morphología PIPE_DASH, retícula de 10 gates y sello post-cuántico.',
);
h2('1.1 Predicado de conformidad (memorizar)');
mono('Π_pass ⇔ K_hashcod✓ ∧ HVC✓ ∧ H_int✓ ∧ Orig✓ ∧ Human✓ ∧ (Σ w_i s_i ≥ 0.75)');
p(
  'Traducción: solo hay “pass” si la clave hashcod tiene formato válido, el certificado HVC está adjunto, la integridad de hashes es correcta, la originalidad pasa el umbral, un humano marca aprobación, y el score compuesto ≥ 75.',
);

h2('1.2 Por qué la UI es “imposible”');
p(
  'Los menús usan glifos griegos (Σ, Ω, Δ, Φ, Λ, Ψ…). Los modos y clearances están bloqueados por frases de elevación. Los errores se codifican F278-E**. Esto no es un defecto: es una superficie de control. Usted, con este manual, es el operador autorizado.',
);

// —— 2. ARQUITECTURA ——
doc.addPage();
banner('SECCIÓN 2 — ARQUITECTURA DE CAPAS L0–L10');
h1('2. Capas semánticas');
const layers = [
  ['L0', 'Payload fenomenal — texto/código del activo IA'],
  ['L1', 'Canonical LF-stream — normalización de saltos de línea'],
  ['L2', 'Digest stratum — contentHash y promptHash (SHA-256)'],
  ['L3', 'Metadata envelope — JSON con claves ordenadas'],
  ['L4', 'Commitment lattice — C = H(ch ‖ mh ‖ serial ‖ FIST278-v1)'],
  ['L5', 'Dossier 100-F — 100 formularios área×función'],
  ['L6', 'HVC key morphology — clave > |…|-…| <'],
  ['L7', 'Retícula multi-gate — 10 gates, 3 críticos'],
  ['L8', 'Human attestation — checkbox de revisor'],
  ['L9', 'PQC seal stratum — sello post-cuántico'],
  ['L10', 'Export forensic pack — JSON token + HVC + dossier'],
];
for (const [id, d] of layers) {
  mono(`${id}  ${d}`);
}

// —— 3. CLEARANCE ——
doc.addPage();
banner('SECCIÓN 3 — CLEARANCE Y FRASES DE ELEVACIÓN (SECRETO OPERATIVO)');
h1('3. Niveles de clearance');
p(
  'En Ω-CONSOLE (ruta /ops) eleve su clearance pegando la frase exacta. Las frases son case-sensitive.',
);

const phrases = [
  ['C0-PUBLIC-OBSERVER', '(vacío — estado inicial)'],
  ['C1-DOSSIER-SCRIBE', 'SCRIBE-100F-DELTA'],
  ['C2-TOKEN-FORGER', 'FORGE-PHI-COMMIT'],
  ['C3-HVC-BEARER', 'HVC-PIPE-DASH-PSI'],
  ['C4-LATTICE-VALIDATOR', 'LATTICE-LAMBDA-PASS'],
  ['C5-PQC-SEALER', 'SEAL-SIGMA-PQC'],
  ['C6-ROOT-OPERATOR', 'hashcod-ROOT-OMEGA-278'],
];

h2('3.1 Tabla de frases (NO compartir fuera del equipo operador)');
for (const [clr, ph] of phrases) {
  mono(`${clr}`);
  mono(`    →  ${ph}`);
  doc.moveDown(0.15);
}

h2('3.2 Modos Ω autorizados por clearance');
bullet([
  'C0 → solo Ω-SILENT',
  'C1 → Ω-DOSSIER (formularios 100-F)',
  'C2 → Ω-FORGE (tokenizar)',
  'C3 → Ω-CERT (subir HVC / clave)',
  'C4 → Ω-VALIDATE (gates + human)',
  'C5 → Ω-SEAL (sello PQC)',
  'C6 → Ω-AUDIT + todos los anteriores',
]);
p(
  'Procedimiento: abra /ops → seleccione clearance objetivo → pegue frase → ELEVAR_CLR → active el modo Ω correspondiente.',
);

// —— 4. PIPELINE ——
doc.addPage();
banner('SECCIÓN 4 — PIPELINE OPERATIVO α→θ (PROCEDIMIENTO COMPLETO)');
h1('4. Secuencia obligatoria');

h2('α-INGEST — Preparar el activo');
bullet([
  'Reúna: contenido generado por IA, modelo, prompt, steward, licencia.',
  'Decida jurisdicción, confidencialidad y si aplica HNDL.',
]);

h2('β-DOSSIER — Completar los 100 formularios');
bullet([
  'Ruta: /registration (menú Δ-100F DOSSIER).',
  'Eleve clearance a C1 con frase SCRIBE-100F-DELTA.',
  'Cada formulario tiene un ÁREA única y una FUNCIÓN única.',
  'Use “Guardar y siguiente”. Progreso debe llegar a 100%.',
  'Exporte el dossier JSON como evidencia forense.',
  'Opcional: “Ir a tokenizar (con prefill)” para copiar campos clave.',
]);

h2('γ-CANON — Congelar contenido');
bullet([
  'Asegúrese de que el contenido no cambiará tras el hash (formulario de freeze en el dossier).',
  'Charset UTF-8 recomendado. Saltos de línea se normalizan a LF.',
]);

h2('δ-FORGE — Tokenizar');
bullet([
  'Ruta: /tokenize (Φ-TOKEN FORGE). Clearance C2: FORGE-PHI-COMMIT.',
  'Complete título, tipo, contenido (≥20 caracteres), modelo, prompt, steward.',
  'Al enviar se generan: contentHash, metadataHash, commitmentHash, serial FST-YEAR-####.',
  'Será redirigido a /tokens/:id.',
]);

h2('ε-HVC — Certificado hashcod con clave PIPE_DASH');
bullet([
  'Clearance C3: HVC-PIPE-DASH-PSI.',
  'En el detalle del token, sección certificado:',
  'La clave DEBE tener la forma exacta (solo | y - entre > y <):',
]);
mono(
  '> |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <',
);
bullet([
  'Pegue la clave o suba un JSON/TXT que la contenga (campo hashcodKey o texto plano).',
  'Ejemplo JSON mínimo:',
]);
mono(`{
  "issuer": "hashcod",
  "standard": "FIST278",
  "hashcodKey": "> |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <"
}`);
bullet([
  'Pulse “Subir certificado hashcod”.',
  'Sin esta clave, el gate hashcod_certificate falla y Π_pass es imposible.',
]);

h2('ζ-GATE — Validación multi-gate');
bullet([
  'Clearance C4: LATTICE-LAMBDA-PASS.',
  'Marque “Aprobación humana”.',
  'Pulse “Ejecutar validación FIST278”.',
  'Gates críticos: integrity, originality, hashcod_certificate.',
  'Decisión pass solo si predicado Π_pass se cumple.',
]);

h2('η-SEAL — Sello PQC');
bullet([
  'Clearance C5: SEAL-SIGMA-PQC.',
  'Solo disponible si status = validated.',
  'Pulse “Sellar PQC-ready”. Se genera sealHash declarado.',
]);

h2('θ-EXPORT — Paquete forense');
bullet([
  'Export token JSON desde el detalle del token.',
  'Export HVC JSON del certificado.',
  'Export dossier 100-F desde /registration.',
  'Conserve los tres artefactos juntos.',
]);

// —— 5. MAPA DE RUTAS ——
doc.addPage();
banner('SECCIÓN 5 — MAPA DE RUTAS (MENÚ GLIFO → FUNCIÓN REAL)');
h1('5. Traducción del menú');
const routes = [
  ['Σ-DASH', '/', 'Dashboard / plano de control'],
  ['Ω-CONSOLE', '/ops', 'Clearance, modos, capas, errores'],
  ['Δ-100F DOSSIER', '/registration', '100 formularios de registro'],
  ['Φ-TOKEN FORGE', '/tokenize', 'Crear token'],
  ['Λ-REGISTRY', '/registry', 'Lista de tokens'],
  ['Ψ-NORM FIST278', '/standard', 'Texto del estándar'],
  ['Γ-IP PIPELINE', '/projects', 'Pipeline IP avanzado'],
  ['μ-MATH LATTICE', '/mathlab', 'Motor matemático RII/AHP/MC'],
  ['ρ-PQC LAB', '/postquantum', 'Catálogo PQC / migración'],
  ['ξ-METHODOLOGY', '/methodology', 'Metodología R-IP/PQ'],
  ['κ-KB', '/knowledge', 'Base de conocimiento'],
];
for (const [g, r, d] of routes) {
  mono(`${g.padEnd(18)} ${r.padEnd(16)} ${d}`);
}

// —— 6. ERRORES ——
doc.addPage();
banner('SECCIÓN 6 — CÓDIGOS DE ERROR Y REMEDIACIÓN');
h1('6. Tabla F278-E**');
const errs = [
  ['F278-E01', 'Dossier incompleto', 'Complete los 100 formularios hasta 100%'],
  ['F278-E02', 'Payload insuficiente', 'Contenido ≥ 20 caracteres; mejore estructura'],
  ['F278-E03', 'Commitment mismatch', 'No edite contenido post-token; re-tokenice'],
  ['F278-E04', 'Clave morphología inválida', 'Use solo | y - entre > y <; ver ejemplo'],
  ['F278-E05', 'HVC ausente', 'Suba certificado con hashcodKey'],
  ['F278-E06', 'Originalidad baja', 'Reduzca solapamiento con tokens previos'],
  ['F278-E07', 'Sin human review', 'Marque checkbox de aprobación humana'],
  ['F278-E08', 'Clearance insuficiente', 'Eleve clearance en /ops con frase correcta'],
  ['F278-E09', 'Sello prematuro', 'Valide con pass antes de sellar'],
  ['F278-E10', 'Emisor ≠ hashcod', 'issuer debe ser "hashcod" (minúsculas)'],
];
for (const [c, n, f] of errs) {
  mono(`${c}  ${n}`);
  doc.font('Helvetica').fontSize(9).text(`    Remediación: ${f}`);
  doc.moveDown(0.25);
}

// —— 7. CHECKLIST ——
doc.addPage();
banner('SECCIÓN 7 — CHECKLIST RÁPIDO DEL OPERADOR');
h1('7. Lista de verificación pre-pass');
bullet([
  '[ ] Clearance ≥ C4 (LATTICE-LAMBDA-PASS)',
  '[ ] Dossier 100-F al 100% (o justificado parcialmente)',
  '[ ] Token creado (serial FST-… visible)',
  '[ ] contentHash / commitmentHash verificados',
  '[ ] Clave hashcod en formato > |||||------|…| < subida',
  '[ ] issuer = hashcod en HVC',
  '[ ] Checkbox human_review = true',
  '[ ] Validación → decision = pass',
  '[ ] (Opcional) Sello PQC con C5',
  '[ ] Export forense de token + HVC + dossier',
]);

h2('7.1 Frases de elevación (copia rápida)');
mono('C1  SCRIBE-100F-DELTA');
mono('C2  FORGE-PHI-COMMIT');
mono('C3  HVC-PIPE-DASH-PSI');
mono('C4  LATTICE-LAMBDA-PASS');
mono('C5  SEAL-SIGMA-PQC');
mono('C6  hashcod-ROOT-OMEGA-278');

// —— 8. LEGAL ——
doc.addPage();
banner('SECCIÓN 8 — NOTAS FINALES');
h1('8. Autoridad y marca');
p(
  'La autoridad de certificación es hashcod (siempre en minúsculas, nunca “HashCod”). La marca de conformidad es: FIST278 · Certified by hashcod.',
);
h2('8.1 Soporte del repositorio');
mono('https://github.com/w129/FIST278');
p(
  'Este manual se distribuye junto a la plataforma en public/docs/FIST278-OPERATOR-MANUAL.pdf y se enlaza desde la UI como “MANUAL PDF”.',
);
h2('8.2 Aviso');
p(
  'La complejidad de la interfaz es intencional. Este PDF es el canal de instrucciones legibles. Distribúyalo solo a operadores autorizados. Las frases de elevación de la Sección 3 son credenciales operativas: trátelas como secretos de procedimiento.',
);

doc.moveDown(2);
doc.font('Helvetica-Bold').fontSize(11).text('— FIN DEL MANUAL DE OPERADOR FIST278 / hashcod —', {
  align: 'center',
});

doc.end();

await new Promise((resolve, reject) => {
  stream.on('finish', resolve);
  stream.on('error', reject);
});

console.log('Wrote', outFile);
