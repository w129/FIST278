export function LevelMeter({ level, max = 9 }: { level: number; max?: number }) {
  return (
    <div className="level-meter" title={`Nivel ${level}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < level ? 'on' : ''} />
      ))}
    </div>
  );
}

export function ReadinessBadge({
  label,
  level,
}: {
  label: string;
  level: number;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span className="muted">{label}</span>
        <span className="mono">
          {level}/9
        </span>
      </div>
      <LevelMeter level={level} />
    </div>
  );
}
