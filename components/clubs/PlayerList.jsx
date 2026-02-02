'use client';

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip
} from 'recharts';
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

  if (!players || players.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No player data available
      </div>
    );
  }

  // Sort players by games played
  const sortedPlayers = [...players].sort((a, b) => (b.gamesPlayed || 0) - (a.gamesPlayed || 0));

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
                {player.proName && (
                  <p className="text-xs sm:text-sm text-slate-400 truncate">{player.proName}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${
                POSITION_COLORS[player.proPos] || POSITION_COLORS.midfielder
              }`}>
                {POSITION_LABELS[player.proPos] || player.favoritePosition || 'MID'}
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

            {player.proOverall && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Overall</span>
                <span className="font-semibold text-yellow-400">{player.proOverall}</span>
              </div>
            )}

            {player.manOfTheMatch > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm mt-2">
                <span className="text-slate-400">Man of Match</span>
                <span className="font-semibold text-yellow-400">{player.manOfTheMatch}</span>
              </div>
            )}

            {/* Expanded Stats */}
            {selectedPlayer === player && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
                <PlayerRadar player={player} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerRadar({ player }) {
  // Normalize stats for radar chart (0-100 scale)
  const gamesPlayed = player.gamesPlayed || 1;
  const goalsPerGame = Math.min(((player.goals || 0) / gamesPlayed) * 50, 100);
  const assistsPerGame = Math.min(((player.assists || 0) / gamesPlayed) * 50, 100);
  const passRate = (player.passSuccessRate || 0.7) * 100;
  const tackleRate = (player.tackleSuccessRate || 0.5) * 100;
  const shotRate = (player.shotSuccessRate || 0.3) * 100;

  const data = [
    { stat: 'Goals', value: goalsPerGame },
    { stat: 'Assists', value: assistsPerGame },
    { stat: 'Passing', value: passRate },
    { stat: 'Shooting', value: shotRate * 2 },
    { stat: 'Tackling', value: tackleRate },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="stat" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Radar
          name={player.name}
          dataKey="value"
          stroke="#06b6d4"
          fill="#06b6d4"
          fillOpacity={0.3}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px'
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
