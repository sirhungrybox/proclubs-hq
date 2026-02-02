'use client';

import { useState } from 'react';

const POSITION_COLORS = {
  goalkeeper: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  defender: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  midfielder: 'bg-green-500/20 text-green-400 border-green-500/30',
  forward: 'bg-red-500/20 text-red-400 border-red-500/30',
  striker: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const POSITION_LABELS = {
  goalkeeper: 'GK',
  defender: 'DEF',
  midfielder: 'MID',
  forward: 'FWD',
  striker: 'FWD',
};

export default function PlayerList({ players }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [sortBy, setSortBy] = useState('gamesPlayed');

  if (!players || players.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No player data available
      </div>
    );
  }

  // Sort players
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'avgRating') return parseFloat(b.avgRating || 0) - parseFloat(a.avgRating || 0);
    if (sortBy === 'goals') return (b.goals || 0) - (a.goals || 0);
    if (sortBy === 'assists') return (b.assists || 0) - (a.assists || 0);
    return (b.gamesPlayed || 0) - (a.gamesPlayed || 0);
  });

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{players.length}</div>
          <div className="text-xs sm:text-sm text-slate-400">Total Players</div>
        </div>
        <div className="card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-400">
            {players.reduce((sum, p) => sum + (p.goals || 0), 0)}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Total Goals</div>
        </div>
        <div className="card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-400">
            {players.reduce((sum, p) => sum + (p.assists || 0), 0)}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Total Assists</div>
        </div>
        <div className="card p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
            {players.reduce((sum, p) => sum + (p.manOfTheMatch || 0), 0)}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Total MOTM</div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-slate-400 py-1">Sort by:</span>
        {[
          { key: 'gamesPlayed', label: 'Games' },
          { key: 'avgRating', label: 'Rating' },
          { key: 'goals', label: 'Goals' },
          { key: 'assists', label: 'Assists' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === key ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Player Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.name || index}
            className="card p-4 sm:p-5 card-hover cursor-pointer"
            onClick={() => setSelectedPlayer(selectedPlayer === player ? null : player)}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="min-w-0 flex-1 mr-2">
                <h3 className="text-base sm:text-lg font-semibold text-white truncate">{player.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    parseFloat(player.avgRating) >= 7.5 ? 'bg-green-500/20 text-green-400' :
                    parseFloat(player.avgRating) >= 7 ? 'bg-cyan-500/20 text-cyan-400' :
                    parseFloat(player.avgRating) >= 6.5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {player.avgRating || '-'}
                  </span>
                  <span className="text-xs text-slate-500">Avg Rating</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${
                POSITION_COLORS[player.proPos] || POSITION_COLORS.midfielder
              }`}>
                {POSITION_LABELS[player.proPos] || 'MID'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-green-400">{player.goals || 0}</div>
                <div className="text-[10px] sm:text-xs text-slate-500">Goals</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-purple-400">{player.assists || 0}</div>
                <div className="text-[10px] sm:text-xs text-slate-500">Assists</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-cyan-400">{player.gamesPlayed || 0}</div>
                <div className="text-[10px] sm:text-xs text-slate-500">Games</div>
              </div>
            </div>

            {player.manOfTheMatch > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Man of Match</span>
                <span className="font-semibold text-yellow-400">⭐ {player.manOfTheMatch}</span>
              </div>
            )}

            {/* Expanded Stats */}
            {selectedPlayer === player && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pass Accuracy</span>
                    <span className="text-white font-medium">{player.passAccuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tackle Success</span>
                    <span className="text-white font-medium">{player.tackleSuccess || 0}%</span>
                  </div>
                  {player.saves > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Saves</span>
                      <span className="text-white font-medium">{player.saves}</span>
                    </div>
                  )}
                  {player.cleanSheets > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clean Sheets</span>
                      <span className="text-white font-medium">{player.cleanSheets}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Minutes Played</span>
                    <span className="text-white font-medium">{(player.minutesPlayed || 0).toLocaleString()}</span>
                  </div>
                  {player.redCards > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Red Cards</span>
                      <span className="text-red-400 font-medium">{player.redCards}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
