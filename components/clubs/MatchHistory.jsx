'use client';

import { useState } from 'react';
import { formatDateTime } from '@/lib/utils';

const MATCH_TYPE_LABELS = {
  'leagueMatch': 'Division Rivals',
  'playoffMatch': 'Playoffs',
  'friendlyMatch': 'Friendly',
};

export default function MatchHistory({ matches, clubId }) {
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No match history available
      </div>
    );
  }

  const filteredMatches = filter === 'all'
    ? matches
    : matches.filter(m => m.matchType === filter);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          All ({matches.length})
        </button>
        {Object.entries(MATCH_TYPE_LABELS).map(([key, label]) => {
          const count = matches.filter(m => m.matchType === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-full text-sm ${filter === key ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <p className="text-slate-400 text-sm">{filteredMatches.length} matches</p>

      {filteredMatches.slice(0, 30).map((match, index) => {
        const result = match.result || 'draw';
        const isExpanded = expandedMatch === (match.matchId || index);

        const resultStyles = {
          win: 'bg-green-500/20 border-green-500/30 text-green-400',
          loss: 'bg-red-500/20 border-red-500/30 text-red-400',
          draw: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
        };

        return (
          <div key={match.matchId || index} className="card overflow-hidden">
            {/* Match Header - Clickable */}
            <button
              onClick={() => setExpandedMatch(isExpanded ? null : (match.matchId || index))}
              className="w-full p-4 sm:p-5 text-left hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border ${resultStyles[result]}`}>
                    {result.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400">
                    {MATCH_TYPE_LABELS[match.matchType] || match.matchType}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {match.timestamp ? formatDateTime(new Date(match.timestamp * 1000).toISOString()) : 'Recent'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl sm:text-3xl font-bold font-display">
                    <span className="text-white">{match.score?.own ?? '-'}</span>
                    <span className="text-slate-500 mx-2">-</span>
                    <span className="text-slate-400">{match.score?.opponent ?? '-'}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400">
                <span className="font-medium text-white truncate max-w-[40%]">Your Club</span>
                <span className="text-slate-600">vs</span>
                <span className="truncate max-w-[40%] text-right">{match.opponent?.name || 'Opponent'}</span>
              </div>
            </button>

            {/* Expanded Stats */}
            {isExpanded && match.players && match.players.length > 0 && (
              <div className="px-4 sm:px-5 pb-5 border-t border-slate-700/50 pt-5 space-y-4">
                {/* Top Performers */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Player Performance
                  </h4>
                  <div className="grid gap-2">
                    {match.players.map((player, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          player.manOfTheMatch ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                            player.rating >= 8 ? 'bg-green-500/20 text-green-400' :
                            player.rating >= 7 ? 'bg-cyan-500/20 text-cyan-400' :
                            player.rating >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {player.rating?.toFixed(1) || '-'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{player.name}</span>
                              {player.manOfTheMatch && (
                                <span className="text-yellow-400 text-xs">⭐ MOTM</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {player.archetype || player.position} • {player.minutesPlayed || Math.round((player.secondsPlayed || 0) / 60)} min
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-center">
                          {player.goals > 0 && (
                            <div>
                              <div className="text-lg font-bold text-white">{player.goals}</div>
                              <div className="text-[10px] text-slate-500">Goals</div>
                            </div>
                          )}
                          {player.assists > 0 && (
                            <div>
                              <div className="text-lg font-bold text-cyan-400">{player.assists}</div>
                              <div className="text-[10px] text-slate-500">Assists</div>
                            </div>
                          )}
                          {player.saves > 0 && (
                            <div>
                              <div className="text-lg font-bold text-purple-400">{player.saves}</div>
                              <div className="text-[10px] text-slate-500">Saves</div>
                            </div>
                          )}
                          {player.goals === 0 && player.assists === 0 && player.saves === 0 && (
                            <div className="text-xs text-slate-500">
                              {player.passesMade}/{player.passAttempts} passes
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
