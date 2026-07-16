/**
 * Figuras vectoriales negras sobre fondo blanco (sin gradientes).
 */
export function VectorBackground() {
  return (
    <div className="vector-bg" aria-hidden="true">
      {/* Rejilla sutil */}
      <svg className="grid-lines" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#000" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Hexágono / token */}
      <svg className="v1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon
          points="100,10 180,55 180,145 100,190 20,145 20,55"
          fill="none"
          stroke="#000"
          strokeWidth="3"
        />
        <polygon
          points="100,40 155,70 155,130 100,160 45,130 45,70"
          fill="#000"
          opacity="0.15"
        />
        <circle cx="100" cy="100" r="22" fill="none" stroke="#000" strokeWidth="3" />
        <rect x="88" y="88" width="24" height="24" fill="#000" />
      </svg>

      {/* Nodo / red */}
      <svg className="v2" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="100" r="14" fill="#000" />
        <circle cx="120" cy="40" r="14" fill="#000" />
        <circle cx="200" cy="90" r="14" fill="#000" />
        <circle cx="150" cy="160" r="14" fill="#000" />
        <circle cx="70" cy="170" r="10" fill="#000" />
        <line x1="40" y1="100" x2="120" y2="40" stroke="#000" strokeWidth="3" />
        <line x1="120" y1="40" x2="200" y2="90" stroke="#000" strokeWidth="3" />
        <line x1="200" y1="90" x2="150" y2="160" stroke="#000" strokeWidth="3" />
        <line x1="150" y1="160" x2="70" y2="170" stroke="#000" strokeWidth="3" />
        <line x1="70" y1="170" x2="40" y2="100" stroke="#000" strokeWidth="3" />
        <line x1="120" y1="40" x2="150" y2="160" stroke="#000" strokeWidth="2" />
      </svg>

      {/* Diamante abstracto */}
      <svg className="v3" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 8 L152 80 L80 152 L8 80 Z" fill="none" stroke="#000" strokeWidth="3" />
        <path d="M80 32 L128 80 L80 128 L32 80 Z" fill="#000" />
        <circle cx="80" cy="80" r="12" fill="#fff" stroke="#000" strokeWidth="2" />
      </svg>

      {/* Chip / bloque */}
      <svg className="v4" viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="120" height="80" fill="none" stroke="#000" strokeWidth="3" />
        <rect x="50" y="50" width="80" height="40" fill="#000" />
        <line x1="50" y1="20" x2="50" y2="30" stroke="#000" strokeWidth="3" />
        <line x1="70" y1="20" x2="70" y2="30" stroke="#000" strokeWidth="3" />
        <line x1="90" y1="20" x2="90" y2="30" stroke="#000" strokeWidth="3" />
        <line x1="110" y1="20" x2="110" y2="30" stroke="#000" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="30" stroke="#000" strokeWidth="3" />
        <line x1="50" y1="110" x2="50" y2="120" stroke="#000" strokeWidth="3" />
        <line x1="90" y1="110" x2="90" y2="120" stroke="#000" strokeWidth="3" />
        <line x1="130" y1="110" x2="130" y2="120" stroke="#000" strokeWidth="3" />
        <line x1="20" y1="50" x2="30" y2="50" stroke="#000" strokeWidth="3" />
        <line x1="20" y1="70" x2="30" y2="70" stroke="#000" strokeWidth="3" />
        <line x1="20" y1="90" x2="30" y2="90" stroke="#000" strokeWidth="3" />
        <line x1="150" y1="50" x2="160" y2="50" stroke="#000" strokeWidth="3" />
        <line x1="150" y1="90" x2="160" y2="90" stroke="#000" strokeWidth="3" />
      </svg>

      {/* Llave / hash abstracto */}
      <svg className="v5" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="28" fill="none" stroke="#000" strokeWidth="4" />
        <circle cx="48" cy="48" r="12" fill="#000" />
        <rect x="70" y="42" width="55" height="12" fill="#000" />
        <rect x="105" y="42" width="10" height="28" fill="#000" />
        <rect x="90" y="42" width="10" height="22" fill="#000" />
      </svg>
    </div>
  );
}
