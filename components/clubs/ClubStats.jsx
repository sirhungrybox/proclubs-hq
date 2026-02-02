'use client';

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function ClubStats({ stats, matches }) {
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
    return {
      match: `M${i + 1}`,
      goals: match.score?.own || 0,
      rating: match.players?.reduce((sum, p) => sum + (p.rating || 0), 0) / (match.players?.length || 1) || 0,
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
          label="Win Rate"
          value={`${stats.winRate || winRate}%`}
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
          label="Goals Against"
          value={stats.goalsAgainst?.toLocaleString()}
          icon="🥅"
          color="cyan"
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
          value={stats.gamesPlayed?.toLocaleString() || totalGames?.toLocaleString()}
          icon="🎮"
        />
        <StatBox
          label="Goal Difference"
          value={goalDiff > 0 ? `+${goalDiff}` : goalDiff}
          icon="📈"
        />
        <StatBox
          label="Avg Goals For"
          value={stats.avgGoalsFor || '-'}
          icon="⚡"
        />
        <StatBox
          label="Avg Goals Against"
          value={stats.avgGoalsAgainst || '-'}
          icon="🛡️"
        />
      </div>

      {/* Recent Form */}
      {stats.recentForm && stats.recentForm.length > 0 && (
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Recent Form</h3>
          <div className="flex gap-2">
            {stats.recentForm.map((result, i) => (
              <div
                key={i}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                  result === 'W' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  result === 'L' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Type Breakdown */}
      {stats.matchTypes && (
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Match Types</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.matchTypes.leagueMatch > 0 && (
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400">{stats.matchTypes.leagueMatch}</div>
                <div className="text-xs text-slate-400">Division Rivals</div>
              </div>
            )}
            {stats.matchTypes.playoffMatch > 0 && (
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{stats.matchTypes.playoffMatch}</div>
                <div className="text-xs text-slate-400">Playoffs</div>
              </div>
            )}
            {stats.matchTypes.friendlyMatch > 0 && (
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{stats.matchTypes.friendlyMatch}</div>
                <div className="text-xs text-slate-400">Friendlies</div>
              </div>
            )}
          </div>
        </div>
      )}

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
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Recent Goals</h3>
            <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
              <BarChart data={matchChartData}>
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
                <Bar dataKey="goals" fill="#22c55e" name="Goals Scored" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

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
