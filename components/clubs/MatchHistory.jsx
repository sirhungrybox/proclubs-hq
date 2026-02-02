'use client';

import { useState } from 'react';
import { formatDateTime } from '@/lib/utils';
import MatchPitchView from './MatchPitchView';

const MATCH_TYPE_LABELS = {
  'leagueMatch': 'Division Rivals',
  'playoffMatch': 'Playoffs',
  'friendlyMatch': 'Friendly',
};

function PassCompletionBar({ made, attempts, label }) {
  const percentage = attempts > 0 ? Math.round((made / attempts) * 100) : 0;
  const barColor = percentage >= 85 ? 'bg-green-500' :
                   percentage >= 75 ? 'bg-cyan-500' :
                   percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[10px] text-slate-500 text-right">{made}/{attempts}</div>
    </div>
  );
}

function RatingBadge({ rating, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const colorClass = rating >= 8.0 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                     rating >= 7.0 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                     rating >= 6.0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                     'bg-red-500/20 text-red-400 border-red-500/30';

  return (
    <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold border ${colorClass}`}>
      {rating?.toFixed(1) || '-'}
    </div>
  );
}

function PlayerMatchCard({ player }) {
  const passCompletion = player.passAttempts > 0
    ? Math.round((player.passesMade / player.passAttempts) * 100)
    : 0;
  const tackleSuccess = player.tackleAttempts > 0
    ? Math.round((player.tacklesMade / player.tackleAttempts) * 100)
    : 0;

  return (
    <div className={`p-3 sm:p-4 rounded-xl ${player.manOfTheMatch ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-800/50'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <RatingBadge rating={player.rating} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{player.name}</span>
              {player.manOfTheMatch && (
                <span className="text-yellow-400 text-xs font-medium bg-yellow-500/20 px-1.5 py-0.5 rounded">MOTM</span>
              )}
            </div>
            <div className="text-xs text-slate-400">{player.archetype || 'Unknown'}</div>
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {player.minutesPlayed || Math.round((player.secondsPlayed || 0) / 60)} min
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {player.goals > 0 && (
          <div className="text-center p-2 bg-slate-900/50 rounded-lg">
            <div className="text-lg font-bold text-white">{player.goals}</div>
            <div className="text-[10px] text-slate-500">Goals</div>
          </div>
        )}
        {player.assists > 0 && (
          <div className="text-center p-2 bg-slate-900/50 rounded-lg">
            <div className="text-lg font-bold text-cyan-400">{player.assists}</div>
            <div className="text-[10px] text-slate-500">Assists</div>
          </div>
        )}
        {player.shots > 0 && (
          <div className="text-center p-2 bg-slate-900/50 rounded-lg">
            <div className="text-lg font-bold text-purple-400">{player.shots}</div>
            <div className="text-[10px] text-slate-500">Shots</div>
          </div>
        )}
        {player.saves > 0 && (
          <div className="text-center p-2 bg-slate-900/50 rounded-lg">
            <div className="text-lg font-bold text-yellow-400">{player.saves}</div>
            <div className="text-[10px] text-slate-500">Saves</div>
          </div>
        )}
        {player.interceptions > 0 && (
          <div className="text-center p-2 bg-slate-900/50 rounded-lg">
            <div className="text-lg font-bold text-blue-400">{player.interceptions}</div>
            <div className="text-[10px] text-slate-500">Int</div>
          </div>
        )}
        {player.dribbles > 0 && (
          <div className="text-center p-2 bg-slate-900/50 rounded-lg">
            <div className="text-lg font-bold text-green-400">{player.dribbles}</div>
            <div className="text-[10px] text-slate-500">Dribbles</div>
          </div>
        )}
      </div>

      {/* Pass & Tackle Completion Bars */}
      <div className="grid sm:grid-cols-2 gap-3">
        <PassCompletionBar
          made={player.passesMade}
          attempts={player.passAttempts}
          label="Pass Accuracy"
        />
        {player.tackleAttempts > 0 && (
          <PassCompletionBar
            made={player.tacklesMade}
            attempts={player.tackleAttempts}
            label="Tackle Success"
          />
        )}
      </div>

      {/* Red Card */}
      {player.redCards > 0 && (
        <div className="mt-2 text-xs text-red-400 font-medium">
          Red Card
        </div>
      )}
    </div>
  );
}

export default function MatchHistory({ matches, clubId }) {
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'pitch'

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
        const isExpanded = expandedMatch === (match.matchId || match.id || index);

        const resultStyles = {
          win: 'bg-green-500/20 border-green-500/30 text-green-400',
          loss: 'bg-red-500/20 border-red-500/30 text-red-400',
          draw: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
        };

        return (
          <div key={match.matchId || match.id || index} className="card overflow-hidden">
            {/* Match Header - Clickable */}
            <button
              onClick={() => setExpandedMatch(isExpanded ? null : (match.matchId || match.id || index))}
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
                <span className="font-medium text-white truncate max-w-[40%]">{match.clubName || 'Your Club'}</span>
                <span className="text-slate-600">vs</span>
                <span className="truncate max-w-[40%] text-right">{match.opponent?.name || 'Opponent'}</span>
              </div>
            </button>

            {/* Expanded Match Details */}
            {isExpanded && match.players && match.players.length > 0 && (
              <div className="px-4 sm:px-5 pb-5 border-t border-slate-700/50 pt-5">
                {/* View Mode Toggle */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Player Performance
                  </h4>
                  <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewMode('list'); }}
                      className={`px-3 py-1 text-xs rounded-md transition ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      List
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewMode('pitch'); }}
                      className={`px-3 py-1 text-xs rounded-md transition ${viewMode === 'pitch' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Pitch
                    </button>
                  </div>
                </div>

                {/* Pitch View */}
                {viewMode === 'pitch' && (
                  <div className="mb-6">
                    <MatchPitchView players={match.players} showStats={true} />
                  </div>
                )}

                {/* Team Totals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">
                      {match.players.reduce((sum, p) => sum + (p.goals || 0), 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Goals</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-cyan-400">
                      {match.players.reduce((sum, p) => sum + (p.assists || 0), 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Assists</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-400">
                      {match.players.reduce((sum, p) => sum + (p.shots || 0), 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Shots</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-400">
                      {(() => {
                        const totalMade = match.players.reduce((sum, p) => sum + (p.passesMade || 0), 0);
                        const totalAttempts = match.players.reduce((sum, p) => sum + (p.passAttempts || 0), 0);
                        return totalAttempts > 0 ? Math.round((totalMade / totalAttempts) * 100) : 0;
                      })()}%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Pass Acc</div>
                  </div>
                </div>

                {/* Player Cards */}
                {viewMode === 'list' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {match.players.map((player, i) => (
                      <PlayerMatchCard key={player.name || i} player={player} />
                    ))}
                  </div>
                )}

                {/* Compact list for pitch view */}
                {viewMode === 'pitch' && (
                  <div className="space-y-2">
                    {match.players.map((player, i) => (
                      <div
                        key={player.name || i}
                        className={`flex items-center justify-between p-2 rounded-lg ${player.manOfTheMatch ? 'bg-yellow-500/10' : 'bg-slate-800/30'}`}
                      >
                        <div className="flex items-center gap-2">
                          <RatingBadge rating={player.rating} size="sm" />
                          <div>
                            <span className="text-sm font-medium text-white">{player.name}</span>
                            {player.manOfTheMatch && <span className="ml-2 text-yellow-400 text-xs">MOTM</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {player.goals > 0 && <span className="text-white">{player.goals}G</span>}
                          {player.assists > 0 && <span className="text-cyan-400">{player.assists}A</span>}
                          <span className="text-slate-500">
                            {player.passAttempts > 0 ? Math.round((player.passesMade / player.passAttempts) * 100) : 0}% pass
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
