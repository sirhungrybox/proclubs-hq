'use client';

export default function StatBar({ label, home, away, suffix = '', higherIsBetter = true }) {
  const homeVal = typeof home === 'number' ? home : 0;
  const awayVal = typeof away === 'number' ? away : 0;
  const total = homeVal + awayVal || 1;

  const homePercent = (homeVal / total) * 100;
  const awayPercent = (awayVal / total) * 100;

  const homeWins = higherIsBetter ? homeVal > awayVal : homeVal < awayVal;
  const awayWins = higherIsBetter ? awayVal > homeVal : awayVal < homeVal;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className={`font-semibold ${homeWins ? 'text-cyan-400' : 'text-white'}`}>
          {home ?? '-'}{suffix}
        </span>
        <span className="text-slate-400 text-xs uppercase tracking-wide">{label}</span>
        <span className={`font-semibold ${awayWins ? 'text-orange-400' : 'text-slate-300'}`}>
          {away ?? '-'}{suffix}
        </span>
      </div>
      <div className="flex h-2 gap-1 rounded-full overflow-hidden bg-slate-800">
        <div
          className={`transition-all duration-500 ${homeWins ? 'bg-cyan-500' : 'bg-cyan-500/50'}`}
          style={{ width: `${homePercent}%` }}
        />
        <div
          className={`transition-all duration-500 ${awayWins ? 'bg-orange-500' : 'bg-orange-500/50'}`}
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
}

export function StatCard({ label, value, suffix = '', icon, trend }) {
  return (
    <div className="card p-4 text-center">
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-2xl sm:text-3xl font-bold text-white">
        {value ?? '-'}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-slate-400 mt-1">{label}</div>
      {trend !== undefined && (
        <div className={`text-xs mt-2 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}

export function StatRing({ value, max = 100, label, color = 'cyan' }) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    cyan: 'stroke-cyan-500',
    green: 'stroke-green-500',
    yellow: 'stroke-yellow-500',
    red: 'stroke-red-500',
    orange: 'stroke-orange-500',
  };

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-800"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className={colors[color]}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-[10px] text-slate-400">{label}</span>
      </div>
    </div>
  );
}
