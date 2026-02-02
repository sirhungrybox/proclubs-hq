'use client';

import { useState } from 'react';
import { formatDateTime } from '@/lib/utils';
import StatBar from './StatBar';

export default function MatchHistory({ matches, clubId }) {
  const [expandedMatch, setExpandedMatch] = useState(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No match history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">{matches.length} recent matches</p>

      {matches.slice(0, 20).map((match, index) => {
        const clubData = match.clubs?.[clubId] || Object.values(match.clubs)[0];
        const opponentEntry = Object.entries(match.clubs).find(([id]) => id !== String(clubId));
        const opponentData = opponentEntry?.[1];

        const result = clubData?.result || (
          clubData?.goals > (opponentData?.goals || 0) ? 'win' :
          clubData?.goals < (opponentData?.goals || 0) ? 'loss' : 'draw'
        );

        const resultStyles = {
          win: 'bg-green-500/20 border-green-500/30 text-green-400',
          loss: 'bg-red-500/20 border-red-500/30 text-red-400',
          draw: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
        };

        const isExpanded = expandedMatch === (match.matchId || index);

        return (
          <div key={match.matchId || index} className="card overflow-hidden">
            {/* Match Header - Clickable */}
            <button
              onClick={() => setExpandedMatch(isExpanded ? null : (match.matchId || index))}
              className="w-full p-4 sm:p-5 text-left hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border ${resultStyles[result] || resultStyles.draw}`}>
                    {result?.toUpperCase() || 'N/A'}
                  </span>
                  <span className="text-slate-400 text-xs sm:text-sm">
                    {match.timestamp ? formatDateTime(new Date(match.timestamp * 1000).toISOString()) : 'Recent'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl sm:text-3xl font-bold font-display">
                    <span className="text-white">{clubData?.goals ?? '-'}</span>
                    <span className="text-slate-500 mx-2">-</span>
                    <span className="text-slate-400">{opponentData?.goals ?? '-'}</span>
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
                <span className="font-medium text-white truncate max-w-[40%]">{clubData?.name || 'Your Club'}</span>
                <span className="text-slate-600">vs</span>
                <span className="truncate max-w-[40%] text-right">{opponentData?.name || 'Opponent'}</span>
              </div>
            </button>

            {/* Expanded Stats */}
            {isExpanded && (
              <div className="px-4 sm:px-5 pb-5 border-t border-slate-700/50 pt-5 space-y-6">
                {/* Key Stats Bars */}
                <div className="space-y-4">
                  <StatBar
                    label="Possession"
                    home={clubData?.possession}
                    away={opponentData?.possession}
                    suffix="%"
                  />
                  <StatBar
                    label="Shots"
                    home={clubData?.shots}
                    away={opponentData?.shots}
                  />
                  <StatBar
                    label="On Target"
                    home={clubData?.shotsOnTarget}
                    away={opponentData?.shotsOnTarget}
                  />
                  {(clubData?.passAttempts || opponentData?.passAttempts) && (
                    <StatBar
                      label="Passes"
                      home={clubData?.passAttempts}
                      away={opponentData?.passAttempts}
                    />
                  )}
                  {(clubData?.tackles || opponentData?.tackles) && (
                    <StatBar
                      label="Tackles"
                      home={clubData?.tackles}
                      away={opponentData?.tackles}
                    />
                  )}
                  {(clubData?.interceptions || opponentData?.interceptions) && (
                    <StatBar
                      label="Interceptions"
                      home={clubData?.interceptions}
                      away={opponentData?.interceptions}
                    />
                  )}
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      {clubData?.name || 'Your Club'}
                    </h4>
                    <div className="space-y-2">
                      <DetailStat label="Pass Accuracy" value={
                        clubData?.passSuccesses && clubData?.passAttempts
                          ? `${Math.round((clubData.passSuccesses / clubData.passAttempts) * 100)}%`
                          : '-'
                      } />
                      <DetailStat label="Shot Accuracy" value={
                        clubData?.shotsOnTarget && clubData?.shots
                          ? `${Math.round((clubData.shotsOnTarget / clubData.shots) * 100)}%`
                          : '-'
                      } />
                      {clubData?.corners && <DetailStat label="Corners" value={clubData.corners} />}
                      {clubData?.fouls && <DetailStat label="Fouls" value={clubData.fouls} />}
                      {clubData?.redCards && <DetailStat label="Red Cards" value={clubData.redCards} highlight="red" />}
                      {clubData?.yellowCards && <DetailStat label="Yellow Cards" value={clubData.yellowCards} highlight="yellow" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      {opponentData?.name || 'Opponent'}
                    </h4>
                    <div className="space-y-2">
                      <DetailStat label="Pass Accuracy" value={
                        opponentData?.passSuccesses && opponentData?.passAttempts
                          ? `${Math.round((opponentData.passSuccesses / opponentData.passAttempts) * 100)}%`
                          : '-'
                      } />
                      <DetailStat label="Shot Accuracy" value={
                        opponentData?.shotsOnTarget && opponentData?.shots
                          ? `${Math.round((opponentData.shotsOnTarget / opponentData.shots) * 100)}%`
                          : '-'
                      } />
                      {opponentData?.corners && <DetailStat label="Corners" value={opponentData.corners} />}
                      {opponentData?.fouls && <DetailStat label="Fouls" value={opponentData.fouls} />}
                      {opponentData?.redCards && <DetailStat label="Red Cards" value={opponentData.redCards} highlight="red" />}
                      {opponentData?.yellowCards && <DetailStat label="Yellow Cards" value={opponentData.yellowCards} highlight="yellow" />}
                    </div>
                  </div>
                </div>

                {/* Player Performance (if available) */}
                {match.players && match.players.length > 0 && (
                  <div className="pt-4 border-t border-slate-700/50">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Player Ratings
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {match.players.map((player, i) => (
                        <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-cyan-400">{player.rating || '-'}</div>
                          <div className="text-xs text-slate-400 truncate">{player.name}</div>
                          <div className="text-[10px] text-slate-500">{player.position}</div>
                        </div>
                      ))}
                    </div>
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

function DetailStat({ label, value, highlight }) {
  const highlightClass = {
    red: 'text-red-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${highlightClass[highlight] || 'text-white'}`}>{value}</span>
    </div>
  );
}
