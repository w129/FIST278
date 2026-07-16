const SECTIONS = [
  {
    title: 'FIST278 — Estándar internacional hashcod',
    body: `FIST278 es el Framework for International Standardization of Tokenized AI Assets, publicado por hashcod (hashcod International Standards Authority). Es la norma de referencia para tokenizar y validar activos generados por IA. La marca de conformidad es «FIST278 · Certified by hashcod».`,
  },
  {
    title: 'Certificado hashcod obligatorio + clave',
    body: `Según FIST278-4, el certificado hashcod DEBE subirse y presentar una clave con formato: > |||||------|---|-|-|-|||----||||-------|-|-|-|-|-|-|-|-|-|--||-|-|-|-|-|------|||---||||---||||---| <  (solo | y - entre > y <). Sin esa clave la plataforma no da pass. Flujo: Token → pegar/subir clave o archivo .json/.txt → Subir certificado → Validar con aprobación humana.`,
  },
  {
    title: 'Función base: tokenizar y validar activos IA',
    body: `1) Ingiere contenido + modelo + prompt + steward. 2) Tokeniza (SHA-256 + commitment FIST278-v1). 3) Emite Certificado hashcod (HVC). 4) Valida 10 gates (gate crítico HVC). 5) Si pass → sello PQC-ready. Pipeline IP y Math Lab son capas posteriores.`,
  },
  {
    title: 'Formalismo matemático del motor',
    body: `RII = 100 Σ w_i s_i con pesos AHP (autovector de la matriz de Saaty). Novedad ν = 0.6 Ĥ + 0.4(1−HHĨ) sobre el landscape. HNDL: E[L]=V·P(T_CRQC<L)·(1−c). Híbrido: S_h=min(S_c,S_pq)−ρ·0.15·min(…). Pipeline: cadena de Markov P_{i,i}=1−c_i. Madurez: r_{k+1}=r_k+η(Wr+u). Portafolio: π=softmax(s/τ). Todo ejecutable en Math Lab.`,
  },
  {
    title: 'Qué es una IP revolucionaria',
    body: `No basta con ser “nuevo”. Una IP revolucionaria desplaza una restricción que el mercado o la ciencia daban por fija: un límite de seguridad, de escala, de coste o de física de la información. En FIST278 se exige: (1) anomalía documentada, (2) white space en prior art, (3) claim tree defendible, (4) reducción a práctica demostrable.`,
  },
  {
    title: 'Post-cuántico vs. computación cuántica',
    body: `Post-cuántico (PQC) es criptografía clásica resistente a adversarios con computadoras cuánticas. Computación cuántica es hardware/algoritmos que explotan superposición y entrelazamiento. Puedes desarrollar IP en ambos, pero el riesgo HNDL afecta ya a sistemas clásicos con datos de larga vida — por eso el pipeline incluye endurecimiento PQC obligatorio en S6.`,
  },
  {
    title: 'Harvest Now, Decrypt Later (HNDL)',
    body: `Un adversario almacena ciphertext hoy y espera un CRQC. Si la confidencialidad debe durar 10–30 años (salud, estado, IP industrial, backups), migrar a PQC no es opcional. Prioriza: tunnels, backups, archives, PKI roots, code-signing.`,
  },
  {
    title: 'Híbridos clásico + PQC',
    body: `Durante la transición, combina ECDH/X25519 con ML-KEM y firmas duales. Bien compuestos, el atacante debe romper ambos. Mide tamaños de handshake, certificados y firmware. Diseña crypto-agility: flags, negotiation, versioning.`,
  },
  {
    title: 'Estrategia patent vs. trade secret',
    body: `Patente: divulgación a cambio de monopolio temporal; útil si es detectable en productos ajenos. Trade secret: si la ventaja es proceso interno difícil de reverse-engineerar. Dual-track: publica/patenta la interfaz y reserva el know-how de tuning. Documenta inventorship desde S3.`,
  },
  {
    title: 'Freedom to Operate (FTO)',
    body: `Tener una patente no te da derecho a practicar tu invención si infringes la de otro. El landscape de S2 debe separar: (a) patentabilidad de tu idea, (b) riesgo de infracción al implementar. Marca citas bloqueantes y diseña around claims.`,
  },
  {
    title: 'Estándares y gobernanza',
    body: `NIST FIPS 203/204/205 anclan la interoperabilidad. IETF, ETSI y consorcios industriales extienden perfiles. Una IP revolucionaria puede aspirar a contribución en estándares; planifícalo en S9 sin filtrar secretos prematuramente.`,
  },
  {
    title: 'Cómo usar este software',
    body: `1) Crea un proyecto por invención o programa de migración. 2) Avanza el pipeline con checklist y notas. 3) Configura threat model y stack PQC. 4) Registra activos IP. 5) Observa TRL/IPRL/PQRL como semáforos de madurez. Los datos viven en localStorage del navegador.`,
  },
];

export function Knowledge() {
  return (
    <div>
      <div className="page-header">
        <div>
          <p className="kicker">Referencia</p>
          <h2>Base de conocimiento</h2>
          <p className="subtitle">
            Conceptos esenciales para liderar programas de IP de alto impacto y migración post-cuántica.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        {SECTIONS.map((s) => (
          <div key={s.title} className="card">
            <h3>{s.title}</h3>
            <p className="muted" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
