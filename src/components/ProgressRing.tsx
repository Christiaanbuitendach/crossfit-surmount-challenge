interface ProgressRingProps {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
}

/**
 * Circular progress ring (pure SVG). Shows total reps over the goal with a
 * big percentage in the middle. Gold arc on a navy track.
 */
export function ProgressRing({
  value,
  goal,
  size = 240,
  stroke = 18,
}: ProgressRingProps) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(value, goal) / goal) * circumference;

  return (
    <div
      className="relative animate-ring-pop"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFD700"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tabular-nums text-white">
          {pct}%
        </span>
        <span className="mt-1 text-sm font-semibold text-white/70">
          {value.toLocaleString()} / {goal.toLocaleString()}
        </span>
        <span className="text-xs uppercase tracking-widest text-patriot-gold">
          reps
        </span>
      </div>
    </div>
  );
}
