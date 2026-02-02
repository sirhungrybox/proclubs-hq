'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClubStats from '@/components/clubs/ClubStats';
import PlayerList from '@/components/clubs/PlayerList';
import MatchHistory from '@/components/clubs/MatchHistory';
import PitchView from '@/components/clubs/PitchView';

function ClubDetailContent({ clubId }) {
  const searchParams = useSearchParams();
  const platform = searchParams.get('platform') || 'ps5';

  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    fetchClubData();
  }, [clubId, platform]);

  async function fetchClubData() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/ea/clubs/${clubId}?platform=${platform}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch club data');
      }

      setClubData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading club data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">Failed to load club</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link href="/" className="btn-primary">
          Back to Search
        </Link>
      </div>
    );
  }

  const { info, stats, members, matches } = clubData || {};

  // Get recent form from stats or calculate from matches
  const form = stats?.recentForm || matches?.slice(0, 5).map(match => {
    if (match.result === 'win') return 'W';
    if (match.result === 'loss') return 'L';
    return 'D';
  }) || [];

  const tabs = [
    { id: 'matches', label: 'Matches', icon: '📊' },
    { id: 'stats', label: 'Statistics', icon: '📈' },
    { id: 'squad', label: 'Squad', icon: '👥' },
  ];

  return (
    <div>
      {/* Back Link */}
      <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Search
      </Link>

      {/* Club Header */}
      <div className="card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl sm:text-5xl shadow-lg shadow-cyan-500/20 flex-shrink-0">
            ⚽
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
              {info?.name || 'Unknown Club'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              {stats?.winRate && (
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full font-semibold">
                  {stats.winRate}% Win Rate
                </span>
              )}
              {stats?.gamesPlayed && (
                <span className="px-3 py-1 bg-slate-800 rounded-full">
                  {stats.gamesPlayed} Games
                </span>
              )}
              <span className="text-slate-500">ID: {clubId}</span>
            </div>

            {/* Recent Form */}
            {form.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Form:</span>
                <div className="flex gap-1">
                  {form.map((result, i) => (
                    <span
                      key={i}
                      className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                        result === 'W' ? 'bg-green-500/20 text-green-400' :
                        result === 'L' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">{stats?.wins || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{stats?.ties || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Draws</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-400">{stats?.losses || 0}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase">Losses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700/50 mb-8">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-4 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'matches' && (
        <MatchHistory matches={matches} clubId={clubId} />
      )}

      {activeTab === 'stats' && stats && (
        <ClubStats stats={stats} matches={matches} />
      )}

      {activeTab === 'squad' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pitch View */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Formation</h3>
            <PitchView players={members?.members} clubName={info?.name} />
          </div>

          {/* Player List */}
          <div>
            <PlayerList players={members?.members} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClubDetailPage({ params }) {
  const { clubId } = use(params);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    }>
      <ClubDetailContent clubId={clubId} />
    </Suspense>
  );
}
