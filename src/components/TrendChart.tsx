import type { Attempt } from '../types';

interface Props {
  attempts: Attempt[];
  passPercent: number;
}

export function TrendChart({ attempts, passPercent }: Props) {
  const sorted = [...attempts].reverse().slice(0, 20);
  if (sorted.length < 2) return null;

  const W = 480;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const xOf = (i: number) => PAD.left + (i / (sorted.length - 1)) * plotW;
  const yOf = (pct: number) => PAD.top + plotH - (pct / 100) * plotH;

  const passY = yOf(passPercent);
  const points = sorted.map((a, i) => ({ x: xOf(i), y: yOf(a.percent), passed: a.passed, pct: Math.round(a.percent) }));
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

  const yLabels = [0, 25, 50, 75, 100];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Score Trend (last {sorted.length})</h3>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Score trend chart">
          {/* Grid lines */}
          {yLabels.map(v => (
            <g key={v}>
              <line
                x1={PAD.left} y1={yOf(v)} x2={W - PAD.right} y2={yOf(v)}
                stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
              />
              <text x={PAD.left - 6} y={yOf(v)} textAnchor="end" dominantBaseline="middle"
                fontSize="9" fill="currentColor" fillOpacity="0.4">
                {v}
              </text>
            </g>
          ))}

          {/* Pass threshold line */}
          <line
            x1={PAD.left} y1={passY} x2={W - PAD.right} y2={passY}
            stroke="#ef4444" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 3"
          />
          <text x={W - PAD.right + 2} y={passY} dominantBaseline="middle"
            fontSize="8" fill="#ef4444" fillOpacity="0.7">
            {passPercent}%
          </text>

          {/* Trend line */}
          <polyline
            points={polyline}
            fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={p.passed ? '#22c55e' : '#ef4444'} />
              {sorted.length <= 10 && (
                <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity="0.6">
                  {p.pct}
                </text>
              )}
            </g>
          ))}

          {/* X axis attempt labels */}
          {sorted.length <= 10 && points.map((p, i) => (
            <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity="0.4">
              #{i + 1}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
