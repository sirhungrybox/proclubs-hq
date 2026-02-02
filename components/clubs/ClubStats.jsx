'use client';

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function ClubStats({ stats, seasonalStats, matches }) {
  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-400">
        No statistics available
      </div>
    );
  }

  // Calculate win rate
  const totalGames = stats.wins + stats.losses + stats.ties;
  const winRate = totalGames > 0 ? ((stats.wins / totalGames) * 100).toFixed(1) : 0;
  const goalDiff = stats.goals - stats.goalsAgainst;

  // Prepare chart data from matches
  const matchChartData = matches?.slice(0, 10).reverse().map((match, i) => {
    const clubData = Object.values(match.clubs)[0];
    return {
      match: `M${i + 1}`,
      possession: clubData?.possession || 0,
      goals: clubData?.goals || 0,
    };
  }) || [];

  // Win/Draw/Loss pie chart data
  const recordData = [
    { name: 'Wins', value: stats.wins, color: '#22c55e' },
    { name: 'Draws', value: stats.ties, color: '#eab308' },
    { name: 'Losses', value: stats.losses, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="Skill Rating"
          value={seasonalStats?.skill_rating || '-'}
          icon="📊"
          color="cyan"
        />
        <StatBox
          label="Win Rate"
          value={`${winRate}%`}
          icon="🏆"
          color="green"
        />
        <StatBox
          label="Goals Scored"
          value={stats.goals?.toLocaleString()}
          icon="⚽"
          color="purple"
        />
        <StatBox
          label="Clean Sheets"
          value={stats.cleanSheets}
          icon="🧤"
          color="blue"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="Total Games"
          value={totalGames?.toLocaleString()}
          icon="🎮"
        />
        <StatBox
          label="Goal Difference"
          value={goalDiff > 0 ? `+${goalDiff}` : goalDiff}
          icon="📈"
        />
        <StatBox
          label="Titles Won"
          value={stats.titlesWon || 0}
          icon="🏅"
        />
        <StatBox
          label="Best Division"
          value={stats.bestDivision || '-'}
          icon="🥇"
        />
      </div>

      {/* Record Bar */}
      <div className="card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">All-Time Record</h3>
        <div className="flex items-center gap-1 h-8 sm:h-10 rounded-lg overflow-hidden">
          <div
            className="h-full bg-green-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white transition-all"
            style={{ width: `${totalGames > 0 ? (stats.wins / totalGames) * 100 : 0}%`, minWidth: stats.wins > 0 ? '40px' : '0' }}
          >
            {stats.wins}W
          </div>
          <div
            className="h-full bg-yellow-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white transition-all"
            style={{ width: `${totalGames > 0 ? (stats.ties / totalGames) * 100 : 0}%`, minWidth: stats.ties > 0 ? '35px' : '0' }}
          >
            {stats.ties}D
          </div>
          <div
            className="h-full bg-red-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white transition-all"
            style={{ width: `${totalGames > 0 ? (stats.losses / totalGames) * 100 : 0}%`, minWidth: stats.losses > 0 ? '35px' : '0' }}
          >
            {stats.losses}L
          </div>
        </div>
        <div className="flex justify-between mt-2 sm:mt-3 text-xs sm:text-sm text-slate-400">
          <span>Wins: {stats.wins}</span>
          <span>Draws: {stats.ties}</span>
          <span>Losses: {stats.losses}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Win/Draw/Loss Pie Chart */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Record Distribution</h3>
          <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
            <PieChart>
              <Pie
                data={recordData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {recordData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Chart */}
        {matchChartData.length > 0 && (
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Recent Performance</h3>
            <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
              <AreaChart data={matchChartData}>
                <defs>
                  <linearGradient id="possGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="match" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="possession"
                  stroke="#06b6d4"
                  fill="url(#possGradient)"
                  name="Possession %"
                />
                <Bar dataKey="goals" fill="#22c55e" name="Goals" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Seasonal Stats */}
      {seasonalStats && (
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Current Season</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">{seasonalStats.gamesPlayed || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">Games</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-400">{seasonalStats.wins || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">{seasonalStats.ties || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">Draws</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-400">{seasonalStats.losses || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">Losses</div>
            </div>
            <div className="text-center col-span-3 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">{seasonalStats.goals || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mt-1">Goals</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon, color = 'slate' }) {
  const colorClasses = {
    cyan: 'border-cyan-500/30 bg-cyan-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    slate: 'border-slate-700/30 bg-slate-800/50',
  };

  return (
    <div className={`rounded-xl p-3 sm:p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <div className="text-xl sm:text-3xl font-bold font-display text-white">{value}</div>
    </div>
  );
}
