import type { StageDefinition } from '../types';

/**
 * Metodología FIST278 R-IP/PQ
 * Pipeline de 10 etapas para IP revolucionarias con endurecimiento post-cuántico.
 */
export const STAGES: StageDefinition[] = [
  {
    id: 's0_spark',
    order: 0,
    name: 'Chispa Revolucionaria',
    subtitle: 'Captura de la idea anómala',
    description:
      'Registra la intuición o anomalía científica/técnica que podría originar una IP de alto impacto. No filtres todavía: documenta el “por qué nadie lo hace así”.',
    deliverables: [
      'Memoria de chispa (1 página)',
      'Hipótesis de ruptura de paradigma',
      'Mapa de stakeholders potenciales',
    ],
    defaultChecklist: [
      { id: 's0_c1', label: 'Describir la anomalía o insight en lenguaje llano' },
      { id: 's0_c2', label: 'Formular la promesa de valor en una frase' },
      { id: 's0_c3', label: 'Identificar por qué el estado del arte falla' },
      { id: 's0_c4', label: 'Asignar dominio y tags técnicos' },
      { id: 's0_c5', label: 'Definir codename y confidencialidad inicial' },
    ],
    gates: ['Chispa documentada', 'Codename asignado'],
    icon: 'sparkles',
  },
  {
    id: 's1_problem',
    order: 1,
    name: 'Problema Crítico',
    subtitle: 'Encuadre del problema que vale una IP',
    description:
      'Convierte la chispa en un problema bien planteado: quién sufre, cuánto cuesta, y qué restricción (física, de seguridad o de escala) impide soluciones actuales.',
    deliverables: [
      'Problem statement formal',
      'Métricas de éxito (KPIs técnicos)',
      'Restricciones y supuestos',
    ],
    defaultChecklist: [
      { id: 's1_c1', label: 'Escribir problema en formato: Contexto → Falla → Impacto' },
      { id: 's1_c2', label: 'Definir métricas cuantitativas de éxito' },
      { id: 's1_c3', label: 'Listar restricciones no negociables' },
      { id: 's1_c4', label: 'Identificar usuarios/adoptadores tempranos' },
      { id: 's1_c5', label: 'Evaluar ventana de oportunidad temporal' },
    ],
    gates: ['Problem statement aprobado', 'KPIs definidos'],
    icon: 'target',
  },
  {
    id: 's2_prior_art',
    order: 2,
    name: 'Prior Art & Landscape',
    subtitle: 'Mapa del estado del arte y espacios blancos',
    description:
      'Búsqueda estructurada de patentes, papers, estándares y productos. Objetivo: encontrar el espacio blanco defendible, no solo “algo nuevo”.',
    deliverables: [
      'Matriz de prior art',
      'Mapa de espacios blancos (white space)',
      'Riesgos de FTO (Freedom to Operate)',
    ],
    defaultChecklist: [
      { id: 's2_c1', label: 'Buscar patentes (USPTO/EPO/WIPO) con keywords y CPC' },
      { id: 's2_c2', label: 'Revisar literatura científica (arXiv, IEEE, ACM)' },
      { id: 's2_c3', label: 'Mapear estándares relevantes (NIST, IETF, ETSI, ISO)' },
      { id: 's2_c4', label: 'Identificar 3–5 espacios blancos defendibles' },
      { id: 's2_c5', label: 'Documentar riesgos de FTO y citas clave' },
    ],
    gates: ['Landscape documentado', 'Al menos 1 white space viable'],
    icon: 'search',
  },
  {
    id: 's3_claim_tree',
    order: 3,
    name: 'Árbol de Reivindicaciones',
    subtitle: 'Arquitectura de la IP defendible',
    description:
      'Diseña la jerarquía de claims: independent, dependent, method, system, CRM. Incluye claims “post-cuánticos” y de migración híbrida cuando aplique.',
    deliverables: [
      'Árbol de reivindicaciones (claim tree)',
      'Inventorship map',
      'Estrategia de familia de patentes',
    ],
    defaultChecklist: [
      { id: 's3_c1', label: 'Redactar claim independiente principal' },
      { id: 's3_c2', label: 'Añadir claims dependientes de preferencia/embodiments' },
      { id: 's3_c3', label: 'Incluir claims de método y sistema' },
      { id: 's3_c4', label: 'Mapear inventores y contribuciones' },
      { id: 's3_c5', label: 'Definir estrategia de jurisdicción y timing' },
    ],
    gates: ['Claim tree v1', 'Inventorship claro'],
    icon: 'git-branch',
  },
  {
    id: 's4_feasibility',
    order: 4,
    name: 'Viabilidad Técnica',
    subtitle: '¿Se puede construir y defender?',
    description:
      'Pruebas de concepto teóricas, simulaciones y límites físicos/computacionales. En dominio PQ: tamaños de clave, latencia, side-channels, composabilidad.',
    deliverables: [
      'Informe de viabilidad',
      'Modelo de amenazas técnico',
      'Estimación de recursos',
    ],
    defaultChecklist: [
      { id: 's4_c1', label: 'Validar supuestos críticos con cálculo o simulación' },
      { id: 's4_c2', label: 'Estimar complejidad, coste y latencia' },
      { id: 's4_c3', label: 'Identificar riesgos de implementación' },
      { id: 's4_c4', label: 'Comparar vs. baseline del estado del arte' },
      { id: 's4_c5', label: 'Decisión go/no-go documentada' },
    ],
    gates: ['Go/no-go positivo', 'Riesgos principales mitigados o aceptados'],
    icon: 'flask',
  },
  {
    id: 's5_prototype',
    order: 5,
    name: 'Prototipo Revolucionario',
    subtitle: 'De la teoría al artefacto demostrable',
    description:
      'Construye el MVP técnico que materializa la reivindicación central. Debe ser reproducible y suficientemente completo para demo y evaluación.',
    deliverables: [
      'Prototipo funcional',
      'Protocolo de reproducción',
      'Benchmark vs. baseline',
    ],
    defaultChecklist: [
      { id: 's5_c1', label: 'Definir alcance del MVP (in/out)' },
      { id: 's5_c2', label: 'Implementar núcleo de la invención' },
      { id: 's5_c3', label: 'Crear harness de pruebas y benchmarks' },
      { id: 's5_c4', label: 'Documentar limitaciones conocidas' },
      { id: 's5_c5', label: 'Preparar demo reproducible (script/video)' },
    ],
    gates: ['Demo reproducible', 'Benchmark registrado'],
    icon: 'cpu',
  },
  {
    id: 's6_pqc_hardening',
    order: 6,
    name: 'Endurecimiento Post-Cuántico',
    subtitle: 'Seguridad frente a adversarios cuánticos',
    description:
      'Integra o migra a criptografía post-cuántica (NIST PQC), modelos híbridos clásico+PQC, y contramedidas a harvest-now-decrypt-later.',
    deliverables: [
      'Stack PQC seleccionado',
      'Plan de migración híbrida',
      'Threat model HNDL actualizado',
    ],
    defaultChecklist: [
      { id: 's6_c1', label: 'Inventariar crypto clásica vulnerable (RSA/ECC/DH)' },
      { id: 's6_c2', label: 'Seleccionar KEM y firma PQC (NIST FIPS)' },
      { id: 's6_c3', label: 'Diseñar modo híbrido (clásico + PQC)' },
      { id: 's6_c4', label: 'Evaluar tamaños, latencia y UX de claves' },
      { id: 's6_c5', label: 'Documentar plan de crypto-agility' },
    ],
    gates: ['Stack PQC definido', 'Híbrido o justificación de pure-PQC'],
    icon: 'shield',
  },
  {
    id: 's7_ip_package',
    order: 7,
    name: 'Paquete de IP',
    subtitle: 'Listo para protección formal',
    description:
      'Ensambla description, drawings, claims, abstract, y evidencia de reducción a práctica. Decide trade-secret vs. patent vs. dual-track.',
    deliverables: [
      'Borrador de patente / dossier de secreto industrial',
      'Evidencia de reducción a práctica',
      'Estrategia de publicación defensiva (si aplica)',
    ],
    defaultChecklist: [
      { id: 's7_c1', label: 'Completar descripción detallada + ejemplos' },
      { id: 's7_c2', label: 'Preparar figuras/diagramas de soporte' },
      { id: 's7_c3', label: 'Revisar claims con abogado o plantilla rigurosa' },
      { id: 's7_c4', label: 'Decidir patent / trade-secret / dual-track' },
      { id: 's7_c5', label: 'Preparar disclosure y NDAs de terceros' },
    ],
    gates: ['Paquete IP v1 completo', 'Ruta de protección elegida'],
    icon: 'file-lock',
  },
  {
    id: 's8_validation',
    order: 8,
    name: 'Validación Externa',
    subtitle: 'Prueba de valor y de seguridad',
    description:
      'Peer review, pentest, auditoría criptográfica, pilotos con early adopters y feedback de mercado. Ajusta claims y roadmap.',
    deliverables: [
      'Informe de validación',
      'Resultados de piloto',
      'Ajustes a claims y producto',
    ],
    defaultChecklist: [
      { id: 's8_c1', label: 'Diseñar protocolo de validación independiente' },
      { id: 's8_c2', label: 'Ejecutar piloto o review externo' },
      { id: 's8_c3', label: 'Auditar implementación criptográfica' },
      { id: 's8_c4', label: 'Recoger métricas vs. KPIs originales' },
      { id: 's8_c5', label: 'Iterar claims/producto según hallazgos' },
    ],
    gates: ['Validación externa documentada', 'KPIs principales alcanzados o redefinidos'],
    icon: 'check-circle',
  },
  {
    id: 's9_scale',
    order: 9,
    name: 'Escala & Monetización',
    subtitle: 'De IP a ventaja estratégica',
    description:
      'Licenciamiento, spin-out, integración en producto, o estandarización. Gobernanza de familia de patentes y roadmap post-cuántico a 5–10 años.',
    deliverables: [
      'Modelo de negocio / licensing',
      'Roadmap 5 años',
      'Plan de estandarización (opcional)',
    ],
    defaultChecklist: [
      { id: 's9_c1', label: 'Definir modelo: producto, licencia, spin-out, estándar' },
      { id: 's9_c2', label: 'Planificar familia de patentes y continuaciones' },
      { id: 's9_c3', label: 'Roadmap de crypto-agility 5–10 años' },
      { id: 's9_c4', label: 'Identificar partners y canales de adopción' },
      { id: 's9_c5', label: 'Cerrar playbook de mantenimiento de IP' },
    ],
    gates: ['Modelo de captura de valor definido', 'Roadmap aprobado'],
    icon: 'rocket',
  },
];

export const DOMAIN_LABELS: Record<string, string> = {
  crypto: 'Criptografía',
  'quantum-sensing': 'Sensado cuántico',
  'quantum-computing': 'Computación cuántica',
  'pqc-migration': 'Migración PQC',
  'hybrid-systems': 'Sistemas híbridos',
  materials: 'Materiales avanzados',
  'ai-quantum': 'IA + Cuántica',
  other: 'Otro',
};

export const STATUS_LABELS: Record<string, string> = {
  ideation: 'Ideación',
  active: 'Activo',
  validation: 'Validación',
  protection: 'Protección IP',
  commercial: 'Comercial',
  archived: 'Archivado',
};

/** Niveles de madurez FIST278 */
export const READINESS_LEVELS = {
  trl: {
    name: 'TRL — Technology Readiness',
    levels: [
      'Principios básicos observados',
      'Concepto tecnológico formulado',
      'Prueba experimental de concepto',
      'Validación en laboratorio',
      'Validación en entorno relevante',
      'Demostración en entorno relevante',
      'Prototipo en entorno operacional',
      'Sistema completo calificado',
      'Sistema real probado en operación',
    ],
  },
  iprl: {
    name: 'IPRL — IP Readiness',
    levels: [
      'Insight no documentado',
      'Chispa registrada internamente',
      'Prior art preliminar',
      'Claim tree borrador',
      'Disclosure técnico completo',
      'Borrador de patente / trade-secret package',
      'Filing o formalización',
      'Prosecución / fortalezas defensivas',
      'Portafolio activo y monetizable',
    ],
  },
  pqrl: {
    name: 'PQRL — Post-Quantum Readiness',
    levels: [
      'Sin conciencia de riesgo cuántico',
      'Inventario crypto parcial',
      'Threat model HNDL documentado',
      'Algoritmos PQC seleccionados',
      'PoC híbrido o pure-PQC',
      'Integración en prototipo',
      'Benchmarks y side-channel awareness',
      'Crypto-agility operativa',
      'Migración completa + gobernanza',
    ],
  },
};
