/**
 * 100 formularios de registro de tokenización FIST278 / hashcod.
 * Cada uno = área distinta + función distinta.
 */

import type { FormFieldDef, RegistrationFormDef } from '../types/registration';

type Spec = {
  area: string;
  function: string;
  title: string;
  description: string;
  fields: FormFieldDef[];
};

function f(
  id: string,
  label: string,
  type: FormFieldDef['type'],
  extra: Partial<FormFieldDef> = {},
): FormFieldDef {
  return { id, label, type, required: true, ...extra };
}

/** Catálogo de 100 áreas/funciones del registro de tokenización */
const SPECS: Spec[] = [
  {
    area: 'Identidad del solicitante',
    function: 'Registrar la identidad legal del titular del activo a tokenizar',
    title: 'Datos del titular',
    description: 'Identificación del titular o entidad que registra el token.',
    fields: [
      f('full_name', 'Nombre completo / razón social', 'text'),
      f('doc_id', 'Documento / NIT / tax ID', 'text'),
      f('country', 'País de residencia o constitución', 'text'),
      f('email', 'Email de contacto', 'email'),
    ],
  },
  {
    area: 'Representación legal',
    function: 'Declarar apoderados o representantes autorizados a firmar el registro',
    title: 'Representante legal',
    description: 'Persona autorizada a actuar en nombre del titular.',
    fields: [
      f('rep_name', 'Nombre del representante', 'text'),
      f('rep_role', 'Cargo', 'text'),
      f('rep_power', 'Tipo de poder / mandato', 'text'),
      f('rep_email', 'Email del representante', 'email'),
    ],
  },
  {
    area: 'Clasificación del activo',
    function: 'Clasificar el tipo de activo generado por IA a tokenizar',
    title: 'Tipo de activo IA',
    description: 'Define la categoría del output a tokenizar bajo FIST278.',
    fields: [
      f('asset_kind', 'Tipo', 'select', {
        options: [
          'text',
          'code',
          'protocol',
          'design',
          'dataset',
          'invention-disclosure',
          'other',
        ],
      }),
      f('asset_title', 'Título del activo', 'text'),
      f('asset_summary', 'Resumen (abstract)', 'textarea'),
    ],
  },
  {
    area: 'Procedencia del modelo',
    function: 'Documentar el modelo de IA que generó el contenido',
    title: 'Modelo generador',
    description: 'Identificación del modelo, versión y proveedor.',
    fields: [
      f('model_id', 'ID / nombre del modelo', 'text', { placeholder: 'ej. grok-4' }),
      f('model_vendor', 'Proveedor', 'text'),
      f('model_version', 'Versión', 'text'),
      f('model_endpoint', 'Endpoint o entorno', 'text', { required: false }),
    ],
  },
  {
    area: 'Gobernanza del prompt',
    function: 'Capturar y versionar el prompt de generación',
    title: 'Prompt de generación',
    description: 'Prompt usado (se hasheará en el token).',
    fields: [
      f('prompt_text', 'Texto del prompt', 'textarea'),
      f('prompt_version', 'Versión del prompt', 'text'),
      f('prompt_lang', 'Idioma del prompt', 'text'),
    ],
  },
  {
    area: 'Contenido canónico',
    function: 'Depositar el cuerpo del activo a canonicalizar y hashear',
    title: 'Contenido del activo',
    description: 'Contenido que formará el contentHash del token.',
    fields: [
      f('content_body', 'Contenido completo', 'textarea'),
      f('content_format', 'Formato', 'select', {
        options: ['plain', 'markdown', 'code', 'json', 'mixed'],
      }),
      f('content_charset', 'Charset', 'text', { placeholder: 'UTF-8' }),
    ],
  },
  {
    area: 'Steward humano',
    function: 'Asignar el steward humano responsable del activo',
    title: 'Steward / supervisor',
    description: 'Persona humana que supervisa el activo tokenizado.',
    fields: [
      f('steward_name', 'Nombre del steward', 'text'),
      f('steward_org', 'Organización', 'text'),
      f('steward_role', 'Rol', 'text'),
    ],
  },
  {
    area: 'Licenciamiento',
    function: 'Definir la intención de licencia del activo tokenizado',
    title: 'Licencia e intención de uso',
    description: 'Política de uso y licencia declarada.',
    fields: [
      f('license_intent', 'Intención', 'select', {
        options: ['proprietary', 'open', 'dual', 'undecided'],
      }),
      f('license_name', 'Nombre de licencia (si aplica)', 'text', { required: false }),
      f('license_notes', 'Notas de licencia', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Jurisdicción',
    function: 'Fijar la jurisdicción aplicable al registro del token',
    title: 'Jurisdicción legal',
    description: 'Ley y foro aplicables al activo y al token.',
    fields: [
      f('jurisdiction', 'Jurisdicción principal', 'text'),
      f('governing_law', 'Ley aplicable', 'text'),
      f('dispute_forum', 'Foro de disputas', 'text', { required: false }),
    ],
  },
  {
    area: 'Confidencialidad',
    function: 'Clasificar el nivel de confidencialidad del activo',
    title: 'Clasificación de confidencialidad',
    description: 'Nivel de sensibilidad y restricciones de divulgación.',
    fields: [
      f('conf_level', 'Nivel', 'select', {
        options: ['public', 'internal', 'confidential', 'restricted', 'secret'],
      }),
      f('conf_reason', 'Justificación', 'textarea'),
      f('conf_expiry', 'Fecha de desclasificación (si aplica)', 'date', { required: false }),
    ],
  },
  {
    area: 'Retención de datos',
    function: 'Definir políticas de retención del contenido y del token',
    title: 'Retención y archivo',
    description: 'Cuánto tiempo se conserva el activo y evidencias.',
    fields: [
      f('retention_years', 'Años de retención', 'number'),
      f('retention_policy', 'Política de retención', 'textarea'),
      f('archive_location', 'Ubicación de archivo', 'text', { required: false }),
    ],
  },
  {
    area: 'Privacidad y PII',
    function: 'Declarar si el activo contiene datos personales y su base legal',
    title: 'Datos personales (PII)',
    description: 'Cumplimiento de privacidad en el contenido tokenizado.',
    fields: [
      f('has_pii', '¿Contiene PII?', 'select', { options: ['no', 'yes', 'unknown'] }),
      f('pii_types', 'Tipos de PII', 'textarea', { required: false }),
      f('pii_legal_basis', 'Base legal de tratamiento', 'text', { required: false }),
    ],
  },
  {
    area: 'Consentimientos',
    function: 'Registrar consentimientos de terceros embebidos en el activo',
    title: 'Consentimientos de terceros',
    description: 'Autorizaciones de personas u organizaciones citadas o usadas.',
    fields: [
      f('consent_required', '¿Se requiere consentimiento?', 'select', {
        options: ['no', 'yes'],
      }),
      f('consent_holders', 'Titulares del consentimiento', 'textarea', { required: false }),
      f('consent_evidence', 'Evidencia / referencia', 'text', { required: false }),
    ],
  },
  {
    area: 'Derechos de autor previos',
    function: 'Declarar obras preexistentes o materiales de terceros en el activo',
    title: 'Material de terceros',
    description: 'Fragmentos, citas o dependencias con derechos ajenos.',
    fields: [
      f('third_party', '¿Incluye material de terceros?', 'select', {
        options: ['no', 'yes'],
      }),
      f('third_party_list', 'Lista de materiales', 'textarea', { required: false }),
      f('third_party_license', 'Licencias de esos materiales', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Prior art preliminar',
    function: 'Documentar búsquedas preliminares de arte previo relacionadas al activo',
    title: 'Prior art (borrador)',
    description: 'Referencias de patentes, papers o productos similares.',
    fields: [
      f('prior_refs', 'Referencias clave', 'textarea'),
      f('prior_gaps', 'Espacios blancos identificados', 'textarea'),
      f('prior_risk', 'Riesgo de solapamiento (1-5)', 'number'),
    ],
  },
  {
    area: 'Novedad declarada',
    function: 'Formular el claim de novedad del activo tokenizado',
    title: 'Claim de novedad',
    description: 'Qué aporta de nuevo respecto al estado del arte.',
    fields: [
      f('novelty_claim', 'Claim de novedad', 'textarea'),
      f('novelty_evidence', 'Evidencia de soporte', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Inventorship',
    function: 'Mapear inventores/contribuidores humanos del activo',
    title: 'Inventores y contribuidores',
    description: 'Quiénes aportaron creativamente (humanos).',
    fields: [
      f('inventors', 'Lista de inventores/contribuidores', 'textarea'),
      f('inventor_shares', 'Participación estimada (%)', 'text', { required: false }),
    ],
  },
  {
    area: 'Aportación de la IA',
    function: 'Delimitar qué partes fueron generadas por IA vs humanas',
    title: 'División IA / humano',
    description: 'Porcentaje y descripción de contribución automática.',
    fields: [
      f('ai_pct', '% generado por IA', 'number'),
      f('human_pct', '% editado/creado por humanos', 'number'),
      f('ai_parts', 'Partes generadas por IA', 'textarea'),
    ],
  },
  {
    area: 'Cadena de custodia',
    function: 'Registrar la cadena de custodia del activo hasta el token',
    title: 'Cadena de custodia',
    description: 'Quién tuvo acceso y en qué sistemas existió el activo.',
    fields: [
      f('custody_systems', 'Sistemas involucrados', 'textarea'),
      f('custody_handlers', 'Personas con acceso', 'textarea'),
      f('custody_timeline', 'Línea de tiempo', 'textarea'),
    ],
  },
  {
    area: 'Integridad pre-hash',
    function: 'Confirmar que el contenido no se alterará tras el hashing',
    title: 'Congelación de contenido',
    description: 'Declaración de inmutabilidad del cuerpo a hashear.',
    fields: [
      f('content_frozen', '¿Contenido congelado?', 'select', { options: ['yes', 'no'] }),
      f('freeze_date', 'Fecha de congelación', 'date'),
      f('freeze_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Algoritmo de hash',
    function: 'Seleccionar y justificar el algoritmo de compromiso del token',
    title: 'Algoritmo de hashing',
    description: 'Por defecto SHA-256 / dominio FIST278-v1.',
    fields: [
      f('hash_alg', 'Algoritmo', 'select', {
        options: ['SHA-256', 'SHA3-256', 'SHAKE256', 'other'],
      }),
      f('hash_domain', 'Dominio de separación', 'text', { placeholder: 'FIST278-v1' }),
      f('hash_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Serial y nomenclatura',
    function: 'Proponer nomenclatura y preferencias de serial del token',
    title: 'Nomenclatura del token',
    description: 'Preferencias de codename y etiquetas.',
    fields: [
      f('codename', 'Codename preferido', 'text'),
      f('tags', 'Tags (coma-separados)', 'text'),
      f('language', 'Idioma principal del activo', 'text'),
    ],
  },
  {
    area: 'Metadata extendida',
    function: 'Añadir metadata estructurada al envelope del token',
    title: 'Metadata del envelope',
    description: 'Campos adicionales del metadataHash.',
    fields: [
      f('meta_project', 'Proyecto asociado', 'text', { required: false }),
      f('meta_dept', 'Departamento', 'text', { required: false }),
      f('meta_extra', 'JSON / notas de metadata', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Ambiente de generación',
    function: 'Documentar el entorno técnico donde se generó el activo',
    title: 'Entorno de generación',
    description: 'OS, runtime, tools y configuración relevante.',
    fields: [
      f('env_os', 'Sistema operativo', 'text'),
      f('env_runtime', 'Runtime / stack', 'text'),
      f('env_tools', 'Herramientas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Parámetros de muestreo',
    function: 'Registrar temperatura, top-p y parámetros del modelo',
    title: 'Hiperparámetros de generación',
    description: 'Parámetros que afectan la reproducibilidad del output.',
    fields: [
      f('temp', 'Temperature', 'text', { required: false }),
      f('top_p', 'Top-p', 'text', { required: false }),
      f('seed', 'Seed', 'text', { required: false }),
      f('max_tokens', 'Max tokens', 'number', { required: false }),
    ],
  },
  {
    area: 'Reproducibilidad',
    function: 'Evaluar y documentar la reproducibilidad del activo',
    title: 'Reproducibilidad',
    description: '¿Se puede regenerar o solo atestiguar el snapshot?',
    fields: [
      f('repro_level', 'Nivel', 'select', {
        options: ['snapshot-only', 'partial', 'full'],
      }),
      f('repro_steps', 'Pasos de reproducción', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Calidad editorial',
    function: 'Registrar revisión editorial humana del contenido',
    title: 'Revisión editorial',
    description: 'Checklist de calidad de escritura o código.',
    fields: [
      f('edit_reviewer', 'Revisor', 'text'),
      f('edit_date', 'Fecha de revisión', 'date'),
      f('edit_score', 'Score calidad (1-10)', 'number'),
      f('edit_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Pruebas técnicas',
    function: 'Adjuntar resultados de tests o benchmarks del activo (si es código/protocolo)',
    title: 'Tests y benchmarks',
    description: 'Evidencia de verificación técnica.',
    fields: [
      f('tests_ran', '¿Se ejecutaron tests?', 'select', { options: ['yes', 'no', 'n/a'] }),
      f('tests_summary', 'Resumen de resultados', 'textarea', { required: false }),
      f('tests_link', 'Link a reporte', 'url', { required: false }),
    ],
  },
  {
    area: 'Seguridad del contenido',
    function: 'Evaluar riesgos de seguridad en el activo (código malicioso, fugas, etc.)',
    title: 'Revisión de seguridad',
    description: 'Hallazgos de seguridad pre-tokenización.',
    fields: [
      f('sec_risk', 'Nivel de riesgo', 'select', {
        options: ['low', 'medium', 'high', 'critical'],
      }),
      f('sec_findings', 'Hallazgos', 'textarea', { required: false }),
      f('sec_mitigations', 'Mitigaciones', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Threat model del activo',
    function: 'Modelar amenazas específicas del activo tokenizado',
    title: 'Threat model',
    description: 'Actores, activos y vectores de ataque.',
    fields: [
      f('threat_actors', 'Actores de amenaza', 'textarea'),
      f('threat_assets', 'Activos a proteger', 'textarea'),
      f('threat_vectors', 'Vectores', 'textarea'),
    ],
  },
  {
    area: 'Riesgo HNDL',
    function: 'Evaluar exposición Harvest-Now-Decrypt-Later del activo',
    title: 'Riesgo HNDL',
    description: 'Vida útil de confidencialidad y cobertura PQC.',
    fields: [
      f('data_life_years', 'Vida útil confidencialidad (años)', 'number'),
      f('hndl_relevant', '¿HNDL relevante?', 'select', { options: ['yes', 'no'] }),
      f('hndl_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Stack criptográfico objetivo',
    function: 'Declarar KEM, firmas y hashes post-cuánticos objetivo',
    title: 'Stack PQC del registro',
    description: 'Preferencias de endurecimiento post-cuántico.',
    fields: [
      f('pqc_kem', 'KEM', 'select', {
        options: ['ML-KEM-768', 'ML-KEM-1024', 'hybrid', 'other'],
      }),
      f('pqc_sig', 'Firma', 'select', {
        options: ['ML-DSA-65', 'ML-DSA-87', 'SLH-DSA', 'hybrid', 'other'],
      }),
      f('pqc_hybrid', '¿Modo híbrido?', 'select', { options: ['yes', 'no'] }),
    ],
  },
  {
    area: 'Certificado hashcod (prep)',
    function: 'Preparar datos para emisión/subida del certificado hashcod HVC',
    title: 'Preparación HVC hashcod',
    description: 'Sujeto y metadatos del futuro certificado.',
    fields: [
      f('hvc_subject', 'Sujeto del certificado', 'text'),
      f('hvc_org', 'Organización certificada', 'text'),
      f('hvc_notes', 'Notas para la CA hashcod', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Clave hashcod (prep)',
    function: 'Registrar o planificar la clave hashcod en formato | y -',
    title: 'Clave hashcod del registro',
    description: 'La clave debe ser del tipo > |||||------|…| < para validar.',
    fields: [
      f('hashcod_key', 'Clave hashcod', 'textarea', {
        placeholder: '> |||||------|---|-|-|-|||…| <',
      }),
      f('key_source', 'Origen de la clave', 'select', {
        options: ['provided', 'to-be-issued', 'uploaded-later'],
      }),
    ],
  },
  {
    area: 'Cumplimiento FIST278-1',
    function: 'Verificar alcance del registro respecto al objeto del estándar',
    title: 'Conformidad FIST278-1 (alcance)',
    description: 'Declaración de que el activo cae en el campo de aplicación.',
    fields: [
      f('scope_ok', '¿Dentro del alcance FIST278?', 'select', { options: ['yes', 'no'] }),
      f('scope_justification', 'Justificación', 'textarea'),
    ],
  },
  {
    area: 'Cumplimiento FIST278-3',
    function: 'Confirmar requisitos de tokenización (hashes y commitment)',
    title: 'Conformidad FIST278-3 (tokenización)',
    description: 'Checklist de canonicalización y hashing.',
    fields: [
      f('canon_ok', '¿Contenido listo para canonicalizar?', 'select', {
        options: ['yes', 'no'],
      }),
      f('hash_ready', '¿Listo para contentHash?', 'select', { options: ['yes', 'no'] }),
      f('commit_notes', 'Notas de commitment', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Cumplimiento FIST278-4',
    function: 'Planificar la validación multi-gate y el HVC obligatorio',
    title: 'Conformidad FIST278-4 (validación)',
    description: 'Preparación del pipeline de validación.',
    fields: [
      f('val_plan', 'Plan de validación', 'textarea'),
      f('val_reviewer', 'Revisor humano designado', 'text'),
      f('val_date', 'Fecha objetivo de validación', 'date', { required: false }),
    ],
  },
  {
    area: 'Ética de IA',
    function: 'Evaluar consideraciones éticas del activo generado',
    title: 'Ética y uso responsable',
    description: 'Sesgos, daño potencial y salvaguardas.',
    fields: [
      f('ethics_risk', 'Riesgo ético', 'select', {
        options: ['low', 'medium', 'high'],
      }),
      f('ethics_issues', 'Temas identificados', 'textarea', { required: false }),
      f('ethics_safeguards', 'Salvaguardas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Sesgo y fairness',
    function: 'Documentar análisis de sesgo del contenido generado',
    title: 'Análisis de sesgo',
    description: 'Grupos afectados y mitigaciones.',
    fields: [
      f('bias_checked', '¿Se revisó sesgo?', 'select', { options: ['yes', 'no', 'n/a'] }),
      f('bias_findings', 'Hallazgos', 'textarea', { required: false }),
      f('bias_actions', 'Acciones', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Uso dual',
    function: 'Evaluar potencial de uso dual (civil/militar o abuso)',
    title: 'Uso dual y abuso',
    description: 'Riesgos de mal uso del activo tokenizado.',
    fields: [
      f('dual_use', '¿Riesgo de uso dual?', 'select', {
        options: ['no', 'possible', 'yes'],
      }),
      f('dual_notes', 'Notas', 'textarea', { required: false }),
      f('dual_controls', 'Controles', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Export control',
    function: 'Clasificar restricciones de exportación del activo',
    title: 'Control de exportaciones',
    description: 'Regímenes de export control aplicables.',
    fields: [
      f('export_controlled', '¿Controlado?', 'select', { options: ['no', 'yes', 'unknown'] }),
      f('export_regime', 'Régimen', 'text', { required: false }),
      f('export_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Sanciones y screening',
    function: 'Declarar screening de contrapartes y listas de sanciones',
    title: 'Screening de sanciones',
    description: 'Verificación de partes involucradas.',
    fields: [
      f('sanctions_checked', '¿Screening realizado?', 'select', { options: ['yes', 'no'] }),
      f('sanctions_result', 'Resultado', 'select', {
        options: ['clear', 'hit', 'pending'],
      }),
      f('sanctions_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'KYC del titular',
    function: 'Completar know-your-customer del titular del token',
    title: 'KYC titular',
    description: 'Datos de debida diligencia del titular.',
    fields: [
      f('kyc_level', 'Nivel KYC', 'select', {
        options: ['basic', 'standard', 'enhanced'],
      }),
      f('kyc_ref', 'Referencia de expediente KYC', 'text'),
      f('kyc_date', 'Fecha de verificación', 'date'),
    ],
  },
  {
    area: 'AML / CFT',
    function: 'Evaluar riesgos de lavado de activos y financiamiento del terrorismo',
    title: 'AML / CFT',
    description: 'Perfil de riesgo AML del registro.',
    fields: [
      f('aml_risk', 'Riesgo AML', 'select', { options: ['low', 'medium', 'high'] }),
      f('aml_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Beneficiario final',
    function: 'Identificar beneficiarios finales (UBO) del activo/token',
    title: 'Beneficiario final (UBO)',
    description: 'Personas físicas que se benefician del token.',
    fields: [
      f('ubo_names', 'Nombres UBO', 'textarea'),
      f('ubo_pct', 'Participaciones', 'text', { required: false }),
      f('ubo_country', 'Países', 'text', { required: false }),
    ],
  },
  {
    area: 'Valor económico',
    function: 'Estimar valor económico del activo a tokenizar',
    title: 'Valoración económica',
    description: 'Valor declarado para economía del token y HNDL.',
    fields: [
      f('asset_value', 'Valor estimado (USD)', 'number'),
      f('valuation_method', 'Método de valoración', 'text'),
      f('valuation_date', 'Fecha de valoración', 'date'),
    ],
  },
  {
    area: 'Mercado objetivo',
    function: 'Definir mercado y adoptadores del activo tokenizado',
    title: 'Mercado y adoptadores',
    description: 'Segmentos y casos de uso comerciales.',
    fields: [
      f('market_segment', 'Segmento', 'text'),
      f('market_use_cases', 'Casos de uso', 'textarea'),
      f('market_geo', 'Geografías', 'text'),
    ],
  },
  {
    area: 'Competencia',
    function: 'Mapear competidores y alternativas al activo',
    title: 'Landscape competitivo',
    description: 'Productos o métodos rivales.',
    fields: [
      f('competitors', 'Competidores', 'textarea'),
      f('differentiation', 'Diferenciación', 'textarea'),
    ],
  },
  {
    area: 'Modelo de negocio',
    function: 'Declarar cómo se captura valor del token/activo',
    title: 'Modelo de captura de valor',
    description: 'Licencia, producto, servicio, estándar, etc.',
    fields: [
      f('biz_model', 'Modelo', 'select', {
        options: ['product', 'license', 'saas', 'standard', 'internal', 'other'],
      }),
      f('biz_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Partners',
    function: 'Registrar partners técnicos o comerciales del registro',
    title: 'Partners y alianzas',
    description: 'Organizaciones colaboradoras.',
    fields: [
      f('partners_list', 'Partners', 'textarea', { required: false }),
      f('partners_roles', 'Roles', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Dependencias de software',
    function: 'Inventariar dependencias si el activo es código o protocolo',
    title: 'SBOM / dependencias',
    description: 'Librerías y componentes reutilizados.',
    fields: [
      f('deps_list', 'Dependencias principales', 'textarea', { required: false }),
      f('deps_licenses', 'Licencias de deps', 'textarea', { required: false }),
      f('sbom_link', 'Link SBOM', 'url', { required: false }),
    ],
  },
  {
    area: 'Infraestructura cloud',
    function: 'Documentar servicios cloud usados en generación o hosting',
    title: 'Cloud e infraestructura',
    description: 'Proveedores y regiones.',
    fields: [
      f('cloud_provider', 'Proveedor', 'text', { required: false }),
      f('cloud_region', 'Región', 'text', { required: false }),
      f('cloud_services', 'Servicios', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Residencia de datos',
    function: 'Fijar requisitos de residencia y soberanía de datos',
    title: 'Residencia de datos',
    description: 'Dónde pueden residir copias del activo y del token.',
    fields: [
      f('data_residency', 'País/región permitida', 'text'),
      f('cross_border', '¿Transferencias cross-border?', 'select', {
        options: ['no', 'yes', 'restricted'],
      }),
      f('residency_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Cifrado en reposo',
    function: 'Declarar controles de cifrado del activo almacenado',
    title: 'Cifrado en reposo',
    description: 'Algoritmos y gestión de claves en storage.',
    fields: [
      f('rest_cipher', 'Cifrado en reposo', 'select', {
        options: ['AES-256', 'other', 'none'],
      }),
      f('rest_kms', 'KMS / HSM', 'text', { required: false }),
    ],
  },
  {
    area: 'Cifrado en tránsito',
    function: 'Declarar controles de cifrado del activo en transmisión',
    title: 'Cifrado en tránsito',
    description: 'TLS y protocolos de transporte.',
    fields: [
      f('transit_proto', 'Protocolo', 'select', {
        options: ['TLS1.3', 'TLS1.2', 'other'],
      }),
      f('transit_pqc', '¿TLS con PQC/híbrido planificado?', 'select', {
        options: ['yes', 'no', 'planned'],
      }),
    ],
  },
  {
    area: 'Control de acceso',
    function: 'Definir quién puede leer o modificar el registro pre-token',
    title: 'Control de acceso (IAM)',
    description: 'Roles y permisos sobre el dossier de registro.',
    fields: [
      f('access_roles', 'Roles con acceso', 'textarea'),
      f('access_policy', 'Política de acceso', 'textarea'),
    ],
  },
  {
    area: 'Auditoría y logs',
    function: 'Definir requisitos de logging del proceso de registro',
    title: 'Auditoría del registro',
    description: 'Qué eventos se registran y por cuánto tiempo.',
    fields: [
      f('audit_events', 'Eventos auditados', 'textarea'),
      f('audit_retention', 'Retención de logs (días)', 'number'),
    ],
  },
  {
    area: 'Incidentes',
    function: 'Planificar respuesta a incidentes sobre el activo/token',
    title: 'Respuesta a incidentes',
    description: 'Contactos y procedimientos IR.',
    fields: [
      f('ir_contact', 'Contacto IR', 'text'),
      f('ir_sla', 'SLA de respuesta', 'text'),
      f('ir_playbook', 'Playbook / notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Continuidad de negocio',
    function: 'Documentar BCP/DR para el registro y el token',
    title: 'Continuidad (BCP/DR)',
    description: 'RTO/RPO del dossier y del token.',
    fields: [
      f('rto_hours', 'RTO (horas)', 'number', { required: false }),
      f('rpo_hours', 'RPO (horas)', 'number', { required: false }),
      f('bcp_notes', 'Notas BCP', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Backup del dossier',
    function: 'Definir copias de seguridad del registro de tokenización',
    title: 'Backups del registro',
    description: 'Frecuencia y ubicación de backups.',
    fields: [
      f('backup_freq', 'Frecuencia', 'text'),
      f('backup_loc', 'Ubicación', 'text'),
      f('backup_encrypted', '¿Cifrado?', 'select', { options: ['yes', 'no'] }),
    ],
  },
  {
    area: 'Versionado del activo',
    function: 'Establecer política de versiones del contenido tokenizado',
    title: 'Versionado',
    description: 'Cómo se versionan cambios post-token (nuevos tokens).',
    fields: [
      f('version_scheme', 'Esquema de versión', 'text', { placeholder: 'semver / date' }),
      f('version_current', 'Versión actual', 'text'),
      f('version_policy', 'Política', 'textarea'),
    ],
  },
  {
    area: 'Change management',
    function: 'Definir proceso de cambios al dossier de registro',
    title: 'Gestión de cambios',
    description: 'Quién aprueba cambios al registro.',
    fields: [
      f('change_approver', 'Aprobador de cambios', 'text'),
      f('change_process', 'Proceso', 'textarea'),
    ],
  },
  {
    area: 'Aprobaciones internas',
    function: 'Recolectar aprobaciones internas previas a tokenizar',
    title: 'Aprobaciones internas',
    description: 'Legal, seguridad, producto, etc.',
    fields: [
      f('appr_legal', 'Aprobación legal', 'select', {
        options: ['pending', 'approved', 'n/a'],
      }),
      f('appr_security', 'Aprobación seguridad', 'select', {
        options: ['pending', 'approved', 'n/a'],
      }),
      f('appr_product', 'Aprobación producto', 'select', {
        options: ['pending', 'approved', 'n/a'],
      }),
      f('appr_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'NDA y acuerdos',
    function: 'Registrar NDAs y contratos que cubren el activo',
    title: 'Acuerdos y NDA',
    description: 'Contratos relevantes al registro.',
    fields: [
      f('nda_refs', 'Referencias NDA/contratos', 'textarea', { required: false }),
      f('nda_parties', 'Partes', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Publicación defensiva',
    function: 'Decidir si se usará publicación defensiva del activo',
    title: 'Publicación defensiva',
    description: 'Estrategia de divulgación defensiva vs patente.',
    fields: [
      f('def_pub', '¿Publicación defensiva?', 'select', {
        options: ['no', 'yes', 'undecided'],
      }),
      f('def_pub_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Estrategia de patente',
    function: 'Definir si el activo alimentará una familia de patentes',
    title: 'Estrategia de patente',
    description: 'Ruta patent / trade-secret / dual-track.',
    fields: [
      f('ip_route', 'Ruta IP', 'select', {
        options: ['patent', 'trade-secret', 'dual', 'none'],
      }),
      f('ip_notes', 'Notas de estrategia', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Trade secrets',
    function: 'Marcar partes del activo que permanecen como secreto industrial',
    title: 'Secreto industrial',
    description: 'Qué no se incluye en el token o se redacte.',
    fields: [
      f('ts_parts', 'Partes secretas', 'textarea', { required: false }),
      f('ts_controls', 'Controles de secreto', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Marcas y nombres',
    function: 'Registrar marcas o nombres comerciales asociados al activo',
    title: 'Marcas asociadas',
    description: 'Trademarks relacionados.',
    fields: [
      f('tm_names', 'Marcas', 'textarea', { required: false }),
      f('tm_status', 'Estado', 'text', { required: false }),
    ],
  },
  {
    area: 'Estándares de industria',
    function: 'Mapear estándares de industria con los que el activo interactúa',
    title: 'Estándares relacionados',
    description: 'NIST, IETF, ISO, etc.',
    fields: [
      f('std_list', 'Estándares', 'textarea', { required: false }),
      f('std_relation', 'Relación (implementa/extiende/compite)', 'textarea', {
        required: false,
      }),
    ],
  },
  {
    area: 'Interoperabilidad',
    function: 'Declarar requisitos de interoperabilidad del protocolo/activo',
    title: 'Interoperabilidad',
    description: 'Sistemas con los que debe interoperar.',
    fields: [
      f('interop_systems', 'Sistemas', 'textarea', { required: false }),
      f('interop_protocols', 'Protocolos', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Performance',
    function: 'Registrar métricas de rendimiento del activo (si aplica)',
    title: 'Rendimiento',
    description: 'Latencia, throughput, tamaño, etc.',
    fields: [
      f('perf_metrics', 'Métricas', 'textarea', { required: false }),
      f('perf_baseline', 'Baseline', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Escalabilidad',
    function: 'Evaluar límites de escala del activo o sistema',
    title: 'Escalabilidad',
    description: 'Límites conocidos y planes de escala.',
    fields: [
      f('scale_limits', 'Límites', 'textarea', { required: false }),
      f('scale_plan', 'Plan de escala', 'textarea', { required: false }),
    ],
  },
  {
    area: 'UX del activo',
    function: 'Documentar impacto en experiencia de usuario si el activo es producto',
    title: 'Experiencia de usuario',
    description: 'Usuarios y flujos afectados.',
    fields: [
      f('ux_users', 'Usuarios objetivo', 'textarea', { required: false }),
      f('ux_impact', 'Impacto UX', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Accesibilidad',
    function: 'Declarar consideraciones de accesibilidad del activo',
    title: 'Accesibilidad',
    description: 'WCAG u otros criterios si aplica.',
    fields: [
      f('a11y_level', 'Nivel / notas', 'text', { required: false }),
      f('a11y_notes', 'Detalle', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Localización',
    function: 'Definir idiomas y localización del activo tokenizado',
    title: 'Localización e i18n',
    description: 'Idiomas soportados y traducciones.',
    fields: [
      f('i18n_langs', 'Idiomas', 'text'),
      f('i18n_notes', 'Notas de localización', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Documentación',
    function: 'Adjuntar referencias a documentación del activo',
    title: 'Documentación de soporte',
    description: 'Manuales, READMEs, specs.',
    fields: [
      f('docs_links', 'Enlaces / rutas', 'textarea', { required: false }),
      f('docs_status', 'Estado de docs', 'select', {
        options: ['draft', 'complete', 'n/a'],
      }),
    ],
  },
  {
    area: 'Capacitación',
    function: 'Registrar necesidades de training para operar el activo',
    title: 'Capacitación',
    description: 'Quién debe formarse y con qué material.',
    fields: [
      f('train_audience', 'Audiencia', 'text', { required: false }),
      f('train_plan', 'Plan de formación', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Soporte post-token',
    function: 'Definir soporte y mantenimiento tras tokenizar',
    title: 'Soporte y mantenimiento',
    description: 'SLA de soporte del activo/token.',
    fields: [
      f('support_owner', 'Owner de soporte', 'text'),
      f('support_sla', 'SLA', 'text', { required: false }),
      f('support_channels', 'Canales', 'text', { required: false }),
    ],
  },
  {
    area: 'Monitoreo',
    function: 'Definir métricas de monitoreo del activo en producción',
    title: 'Monitoreo',
    description: 'Qué se observa post-despliegue.',
    fields: [
      f('mon_metrics', 'Métricas', 'textarea', { required: false }),
      f('mon_alerts', 'Alertas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Desmantelamiento',
    function: 'Planificar el retiro o revocación del token/activo',
    title: 'Sunset / revocación',
    description: 'Condiciones de retiro del registro.',
    fields: [
      f('sunset_conditions', 'Condiciones de sunset', 'textarea', { required: false }),
      f('revoke_process', 'Proceso de revocación', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Seguros',
    function: 'Declarar coberturas de seguro relacionadas al activo',
    title: 'Seguros y coberturas',
    description: 'Pólizas aplicables (cyber, IP, etc.).',
    fields: [
      f('ins_policies', 'Pólizas', 'textarea', { required: false }),
      f('ins_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Presupuesto de tokenización',
    function: 'Estimar costes del proceso de registro y certificación',
    title: 'Presupuesto',
    description: 'Costes de tokenización, HVC y legal.',
    fields: [
      f('budget_total', 'Presupuesto total (USD)', 'number', { required: false }),
      f('budget_breakdown', 'Desglose', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Cronograma',
    function: 'Fijar hitos del registro hasta token validado',
    title: 'Cronograma del registro',
    description: 'Fechas clave del proceso FIST278.',
    fields: [
      f('sched_start', 'Inicio', 'date'),
      f('sched_token', 'Fecha objetivo de token', 'date', { required: false }),
      f('sched_validate', 'Fecha objetivo de validación', 'date', { required: false }),
      f('sched_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Riesgos del proyecto',
    function: 'Registrar riesgos del proyecto de tokenización',
    title: 'Registro de riesgos',
    description: 'Riesgos, probabilidad e impacto.',
    fields: [
      f('risk_list', 'Riesgos principales', 'textarea'),
      f('risk_mitigations', 'Mitigaciones', 'textarea'),
    ],
  },
  {
    area: 'Stakeholders',
    function: 'Mapear stakeholders del registro de tokenización',
    title: 'Stakeholders',
    description: 'Interesados internos y externos.',
    fields: [
      f('stake_internal', 'Internos', 'textarea'),
      f('stake_external', 'Externos', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Comunicaciones',
    function: 'Planificar comunicaciones sobre el token/activo',
    title: 'Plan de comunicaciones',
    description: 'Qué se comunica, a quién y cuándo.',
    fields: [
      f('comms_plan', 'Plan', 'textarea', { required: false }),
      f('comms_embargo', 'Embargo / fecha de anuncio', 'date', { required: false }),
    ],
  },
  {
    area: 'Medios y prensa',
    function: 'Preparar mensajes públicos sobre el activo tokenizado',
    title: 'Mensajes públicos',
    description: 'Talking points y restricciones.',
    fields: [
      f('press_points', 'Talking points', 'textarea', { required: false }),
      f('press_restrictions', 'Restricciones', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Comunidad open source',
    function: 'Si el activo es open source, definir relación con la comunidad',
    title: 'Open source / comunidad',
    description: 'Repos, governance, code of conduct.',
    fields: [
      f('oss_yes', '¿Open source?', 'select', { options: ['no', 'yes', 'planned'] }),
      f('oss_license', 'Licencia OSS', 'text', { required: false }),
      f('oss_governance', 'Gobernanza', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Contribuciones externas',
    function: 'Registrar contribuidores externos al activo',
    title: 'Contribuidores externos',
    description: 'CLA, DCO y lista de contribuidores.',
    fields: [
      f('ext_contribs', 'Contribuidores', 'textarea', { required: false }),
      f('ext_cla', '¿CLA/DCO firmado?', 'select', {
        options: ['n/a', 'yes', 'no', 'partial'],
      }),
    ],
  },
  {
    area: 'Dataset de entrenamiento',
    function: 'Declarar datasets usados si el activo es un modelo o depende de ellos',
    title: 'Datasets de origen',
    description: 'Fuentes de datos de entrenamiento o contexto.',
    fields: [
      f('dataset_names', 'Datasets', 'textarea', { required: false }),
      f('dataset_licenses', 'Licencias de datasets', 'textarea', { required: false }),
      f('dataset_pii', '¿PII en datasets?', 'select', {
        options: ['no', 'yes', 'unknown', 'n/a'],
      }),
    ],
  },
  {
    area: 'Fine-tuning',
    function: 'Documentar fine-tuning o RAG usado en la generación',
    title: 'Fine-tuning / RAG',
    description: 'Adaptaciones del modelo base.',
    fields: [
      f('ft_used', '¿Fine-tuning/RAG?', 'select', {
        options: ['no', 'fine-tune', 'rag', 'both'],
      }),
      f('ft_details', 'Detalles', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Evaluación de modelo',
    function: 'Registrar evaluaciones del modelo generador para este activo',
    title: 'Eval del modelo',
    description: 'Benchmarks o evals cualitativas.',
    fields: [
      f('eval_summary', 'Resumen de eval', 'textarea', { required: false }),
      f('eval_score', 'Score (si aplica)', 'text', { required: false }),
    ],
  },
  {
    area: 'Red teaming',
    function: 'Documentar ejercicios de red team sobre el activo',
    title: 'Red team / adversarial',
    description: 'Pruebas adversariales realizadas.',
    fields: [
      f('rt_done', '¿Red team realizado?', 'select', { options: ['yes', 'no', 'planned'] }),
      f('rt_findings', 'Hallazgos', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Content safety',
    function: 'Evaluar seguridad de contenido (odio, sexual, violencia, etc.)',
    title: 'Content safety',
    description: 'Filtros y clasificación de seguridad de contenido.',
    fields: [
      f('cs_level', 'Nivel de riesgo de contenido', 'select', {
        options: ['safe', 'review', 'unsafe'],
      }),
      f('cs_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Atribución y citas',
    function: 'Registrar citas y atribuciones requeridas en el activo',
    title: 'Atribuciones',
    description: 'Créditos y citas obligatorias.',
    fields: [
      f('attr_list', 'Atribuciones', 'textarea', { required: false }),
      f('attr_style', 'Estilo de cita', 'text', { required: false }),
    ],
  },
  {
    area: 'Trazabilidad de fuentes',
    function: 'Mapear fuentes usadas por el modelo o el humano en el activo',
    title: 'Fuentes y trazas',
    description: 'Orígenes de información no generativa o contextual.',
    fields: [
      f('sources_list', 'Fuentes', 'textarea', { required: false }),
      f('sources_method', 'Método de trazabilidad', 'text', { required: false }),
    ],
  },
  {
    area: 'Watermarking',
    function: 'Declarar marcas de agua o señales de procedencia en el contenido',
    title: 'Watermark / provenance signals',
    description: 'Watermarks técnicos o semánticos.',
    fields: [
      f('wm_present', '¿Watermark?', 'select', { options: ['no', 'yes', 'planned'] }),
      f('wm_type', 'Tipo', 'text', { required: false }),
      f('wm_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Detección de IA',
    function: 'Registrar resultados de detectores de contenido generado por IA',
    title: 'Detección de contenido IA',
    description: 'Scores de clasificadores de AI-generated content.',
    fields: [
      f('detect_tool', 'Herramienta', 'text', { required: false }),
      f('detect_score', 'Score / resultado', 'text', { required: false }),
      f('detect_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Originalidad cuantitativa',
    function: 'Aportar métricas de originalidad (similitud, entropía, etc.)',
    title: 'Métricas de originalidad',
    description: 'Valores para el gate de originalidad del validador.',
    fields: [
      f('orig_method', 'Método', 'text', { required: false }),
      f('orig_score', 'Score', 'text', { required: false }),
      f('orig_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Similitud vs registro',
    function: 'Declarar comparación del activo contra tokens previos del registro',
    title: 'Similitud con registro local',
    description: '¿Se revisó solapamiento con tokens existentes?',
    fields: [
      f('sim_checked', '¿Revisado?', 'select', { options: ['yes', 'no'] }),
      f('sim_result', 'Resultado', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Integración con pipeline IP',
    function: 'Vincular el registro de token al pipeline de IP revolucionaria',
    title: 'Vínculo pipeline IP',
    description: 'Proyecto IP asociado (opcional).',
    fields: [
      f('ip_project_codename', 'Codename de proyecto IP', 'text', { required: false }),
      f('ip_stage_target', 'Etapa objetivo del pipeline', 'text', { required: false }),
    ],
  },
  {
    area: 'TRL / madurez',
    function: 'Auto-evaluar madurez tecnológica del activo',
    title: 'Madurez TRL',
    description: 'Technology Readiness Level estimado.',
    fields: [
      f('trl', 'TRL (1-9)', 'number'),
      f('trl_justification', 'Justificación', 'textarea'),
    ],
  },
  {
    area: 'IPRL / madurez IP',
    function: 'Auto-evaluar madurez de propiedad intelectual',
    title: 'Madurez IPRL',
    description: 'IP Readiness Level estimado.',
    fields: [
      f('iprl', 'IPRL (1-9)', 'number'),
      f('iprl_justification', 'Justificación', 'textarea'),
    ],
  },
  {
    area: 'PQRL / madurez PQC',
    function: 'Auto-evaluar madurez post-cuántica del activo/sistema',
    title: 'Madurez PQRL',
    description: 'Post-Quantum Readiness Level estimado.',
    fields: [
      f('pqrl', 'PQRL (1-9)', 'number'),
      f('pqrl_justification', 'Justificación', 'textarea'),
    ],
  },
  {
    area: 'Sello PQC (prep)',
    function: 'Preparar datos para el sello PQC-ready posterior a validación',
    title: 'Preparación sello PQC',
    description: 'Algoritmo y notas de sellado.',
    fields: [
      f('seal_alg', 'Algoritmo de sello', 'text', {
        placeholder: 'ML-DSA-65+SHA3-256',
        required: false,
      }),
      f('seal_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Export del dossier',
    function: 'Definir formato de exportación del registro completo',
    title: 'Exportación del registro',
    description: 'JSON, PDF legal, paquete HVC, etc.',
    fields: [
      f('export_formats', 'Formatos deseados', 'text'),
      f('export_recipients', 'Destinatarios', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Notificaciones',
    function: 'Configurar notificaciones del ciclo de vida del token',
    title: 'Notificaciones',
    description: 'Quién recibe avisos de validación, sello y revocación.',
    fields: [
      f('notify_emails', 'Emails', 'text'),
      f('notify_events', 'Eventos a notificar', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Integraciones API',
    function: 'Declarar APIs externas usadas en el proceso de registro',
    title: 'APIs e integraciones',
    description: 'Sistemas externos conectados al dossier.',
    fields: [
      f('api_list', 'APIs', 'textarea', { required: false }),
      f('api_auth', 'Métodos de auth', 'text', { required: false }),
    ],
  },
  {
    area: 'Webhooks',
    function: 'Configurar webhooks de eventos de tokenización',
    title: 'Webhooks',
    description: 'URLs de callback para eventos FIST278.',
    fields: [
      f('wh_url', 'URL webhook', 'url', { required: false }),
      f('wh_events', 'Eventos', 'text', { required: false }),
      f('wh_secret_ref', 'Referencia de secreto', 'text', { required: false }),
    ],
  },
  {
    area: 'Ambiente de staging',
    function: 'Separar registro de prueba vs producción',
    title: 'Ambiente del registro',
    description: 'dev / staging / production.',
    fields: [
      f('reg_env', 'Ambiente', 'select', {
        options: ['dev', 'staging', 'production'],
      }),
      f('reg_env_notes', 'Notas', 'textarea', { required: false }),
    ],
  },
  {
    area: 'Criterios de aceptación',
    function: 'Definir DoD del registro de tokenización',
    title: 'Definition of Done del registro',
    description: 'Cuándo se considera completo el dossier de 100 formularios.',
    fields: [
      f('dod_criteria', 'Criterios DoD', 'textarea'),
      f('dod_owner', 'Owner de aceptación', 'text'),
    ],
  },
  {
    area: 'Declaración jurada final',
    function: 'Obtener declaración de veracidad de todo el dossier de registro',
    title: 'Declaración de veracidad',
    description: 'El firmante declara que la información es veraz y completa.',
    fields: [
      f('affiant_name', 'Nombre del declarante', 'text'),
      f('affiant_title', 'Cargo', 'text'),
      f('affidavit_true', 'Declaro que la información es veraz', 'select', {
        options: ['yes'],
      }),
      f('affidavit_date', 'Fecha', 'date'),
    ],
  },
  {
    area: 'Autorización de tokenización',
    function: 'Autorizar explícitamente la creación del token FIST278',
    title: 'Autorización final de tokenizar',
    description: 'Permiso formal para generar el token y solicitar HVC hashcod.',
    fields: [
      f('auth_tokenise', 'Autorizo la tokenización', 'select', { options: ['yes'] }),
      f('auth_name', 'Nombre de quien autoriza', 'text'),
      f('auth_date', 'Fecha de autorización', 'date'),
      f('auth_notes', 'Notas finales', 'textarea', { required: false }),
    ],
  },
];

/** Exactamente 100 formularios (áreas y funciones únicas) */
const SPECS_100 = SPECS.slice(0, 100);

export const REGISTRATION_FORMS: RegistrationFormDef[] = SPECS_100.map((spec, i) => {
  const order = i + 1;
  return {
    id: `form_${String(order).padStart(3, '0')}`,
    order,
    area: spec.area,
    function: spec.function,
    title: spec.title,
    description: spec.description,
    fields: spec.fields,
  };
});

export function getFormById(id: string): RegistrationFormDef | undefined {
  return REGISTRATION_FORMS.find((f) => f.id === id);
}

export function getFormByOrder(order: number): RegistrationFormDef | undefined {
  return REGISTRATION_FORMS.find((f) => f.order === order);
}

export const TOTAL_REGISTRATION_FORMS = REGISTRATION_FORMS.length;
