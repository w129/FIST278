/** Visualizaciones SVG monocromo negro sobre blanco */

export function BarChart({
  values,
  labels,
  height = 120,
  color = '#000000',
}: {
  values: number[];
  labels?: string[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...values, 1e-9);
  const w = 100 / Math.max(1, values.length);
  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className="chart-svg"
    >
      {values.map((v, i) => {
        const h = (v / max) * (height - 24);
        const x = i * w + w * 0.12;
        const bw = w * 0.76;
        const y = height - 16 - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={Math.max(h, 0.5)} fill={color} />
            {labels?.[i] && (
              <text
                x={x + bw / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize="3.2"
                fill="#000000"
              >
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({
  series,
  height = 140,
  colors = ['#000000', '#000000', '#000000'],
  labels,
}: {
  series: number[][];
  height?: number;
  colors?: string[];
  labels?: string[];
}) {
  const flat = series.flat();
  const min = Math.min(...flat, 0);
  const max = Math.max(...flat, 1);
  const n = Math.max(...series.map((s) => s.length), 1);
  const dashes = ['', '4 2', '2 2'];
  const pathFor = (s: number[]) => {
    return s
      .map((v, i) => {
        const x = (i / Math.max(1, n - 1)) * 100;
        const y = 8 + (1 - (v - min) / (max - min || 1)) * (height - 28);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  };
  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="chart-svg"
      >
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={0}
            x2={100}
            y1={8 + g * (height - 28)}
            y2={8 + g * (height - 28)}
            stroke="#000000"
            strokeWidth={0.3}
            opacity={0.25}
          />
        ))}
        {series.map((s, i) => (
          <path
            key={i}
            d={pathFor(s)}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={1.4}
            strokeDasharray={dashes[i % dashes.length]}
          />
        ))}
      </svg>
      {labels && (
        <div className="chart-legend">
          {labels.map((l, i) => (
            <span key={l}>
              <i style={{ background: '#000000' }} />
              {l}
              {i > 0 ? ` (${i + 1})` : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function RadarChart({
  axes,
  values,
  size = 220,
}: {
  axes: string[];
  values: number[];
  size?: number;
}) {
  const n = axes.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number) => {
    const a = angle(i);
    return [cx + r * v * Math.cos(a), cy + r * v * Math.sin(a)];
  };
  const poly = values.map((v, i) => pt(i, Math.max(0, Math.min(1, v))).join(',')).join(' ');
  const rings = [0.25, 0.5, 0.75, 1];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="chart-svg radar">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => pt(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="#000000"
          strokeWidth={1}
          opacity={0.35}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#000000" opacity={0.35} />;
      })}
      <polygon points={poly} fill="#000000" fillOpacity={0.12} stroke="#000000" strokeWidth={2} />
      {axes.map((label, i) => {
        const [x, y] = pt(i, 1.18);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="#000000"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

export function Gauge({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div className="gauge">
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="#000000" strokeWidth={10} opacity={0.15} />
        <circle
          cx={55}
          cy={55}
          r={r}
          fill="none"
          stroke="#000000"
          strokeWidth={10}
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 55 55)"
        />
        <text
          x={55}
          y={58}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill="#000000"
        >
          {value.toFixed(0)}
        </text>
      </svg>
      {label && (
        <div className="muted" style={{ textAlign: 'center', fontSize: '0.78rem', color: '#000' }}>
          {label}
        </div>
      )}
    </div>
  );
}

export function Formula({ children }: { children: string }) {
  return <div className="formula mono">{children}</div>;
}
