# FIST278

**Estándar internacional publicado por hashcod** para tokenizar y validar activos generados por IA.

## Manual de operador (obligatorio)

La UI es deliberadamente densa (clearance, modos Ω, glifos, predicados).  
**Lea el manual PDF antes de operar:**

- En la app: [`/docs/FIST278-OPERATOR-MANUAL.pdf`](./public/docs/FIST278-OPERATOR-MANUAL.pdf)
- Regenerar: `npm run docs:manual`

Incluye frases de elevación de clearance (C1–C6), pipeline α→θ y remediación de errores F278-E**.

## Autoridad

- **Estándar:** FIST278 (Framework for International Standardization of Tokenized AI Assets)
- **Editor / CA:** **hashcod** — hashcod International Standards Authority
- **Marca de conformidad:** `FIST278 · Certified by hashcod`
- **Certificado:** HVC (hashcod Validation Certificate) — **obligatorio para pass**

Sin Certificado hashcod vigente, la validación **no puede** devolver `pass` (cláusula FIST278-4).

## Función base

Tokeniza outputs de IA (SHA-256 + commitment + serial) y ejecuta un **pipeline de 10 gates**, con gate crítico de certificado hashcod, antes del sello PQC-ready. Encima opera el pipeline de IP y el Math Lab.

## Qué incluye

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Centro de mando + ranking softmax del portafolio |
| **Pipeline R-IP/PQ** | 10 etapas con checklists, gates y notas |
| **Math Lab** | AHP, entropía, Monte Carlo HNDL, Markov, híbridos PQC |
| **Motor por proyecto** | RII, grafo de claims, dinámica TRL/IPRL/PQRL, c* óptimo |
| **TRL / IPRL / PQRL** | Madurez acoplada con simulación de trayectoria |
| **Lab Post-Cuántico** | NIST FIPS 203/204/205, híbridos, roadmap de migración |
| **Threat model HNDL** | Riesgo + VaR₉₅ Monte Carlo |
| **Activos IP** | Invenciones, secretos, protocolos, software |
| **Metodología + KB** | Framework completo y formalismo |

## Motor matemático (`src/math/`)

- **linalg** — potencia iterada, Gauss, expm Taylor, κ₂
- **stats** — Shannon, HHI, Monte Carlo, Simpson, softmax
- **ip_scoring** — AHP Saaty, RII, claim graph (radio espectral)
- **pqc** — S_hybrid, HNDL, coste convexo, cobertura óptima c*
- **dynamics** — Markov 10 etapas, esfuerzo óptimo en simplex
- **engine** — informe unificado por proyecto y portafolio

## Stack técnico

- React 19 + TypeScript + Vite
- React Router
- Persistencia en `localStorage` (sin backend)

## Inicio rápido

```bash
cd C:\Users\morap\FIST278
npm install
npm run dev
```

Abre la URL que muestre Vite (normalmente `http://localhost:5173`).

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run preview  # previsualizar build
```

## Metodología R-IP/PQ (resumen)

0. Chispa revolucionaria  
1. Problema crítico  
2. Prior art & landscape  
3. Árbol de reivindicaciones  
4. Viabilidad técnica  
5. Prototipo  
6. **Endurecimiento post-cuántico**  
7. Paquete de IP  
8. Validación externa  
9. Escala & monetización  

## Nota legal

Este software es una herramienta de **organización y metodología**. No sustituye asesoría legal de patentes ni auditorías criptográficas formales. Los algoritmos PQC referenciados se basan en estándares NIST públicos (FIPS 203/204/205).

## Licencia

Uso libre para proyectos personales y de I+D. Adapta el código a tus procesos internos.
