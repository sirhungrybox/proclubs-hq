'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Example clubs that use OurProClub bot
const EXAMPLE_CLUBS = [
  { id: '11247', name: 'AFC Ladzio' },
  { id: '34771', name: 'Bloodline G FC' },
  { id: '270983', name: 'Popping Peggys' },
];

function ClubSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialClubId = searchParams.get('clubId') || '';

  const [clubId, setClubId] = useState(initialClubId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClubId) {
      handleLookup(initialClubId);
    }
  }, []);

  async function handleLookup(id) {
    const clubIdToUse = id || clubId;
    if (!clubIdToUse.trim()) return;

    // Validate it's a number
    if (!/^\d+$/.test(clubIdToUse.trim())) {
      setError('Please enter a valid club ID (numbers only)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Quick check if club exists
      const res = await fetch(`/api/ea/clubs/${clubIdToUse.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.hint || 'Club not found');
      }

      // Redirect to club page
      router.push(`/clubs/${clubIdToUse.trim()}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleLookup();
  }

  return (
    <div>
      {/* Back Link */}
      <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-bold font-display gradient-text mb-2 sm:mb-3">Club Lookup</h1>
        <p className="text-sm sm:text-base text-slate-400">Enter your club ID to view stats and match history</p>
      </div>

      {/* How to get Club ID */}
      <div className="max-w-2xl mx-auto mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <h3 className="text-cyan-400 font-semibold mb-2">How to get your Club ID</h3>
        <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
          <li>Use the OurProClub Discord bot in your server</li>
          <li>Run the <code className="bg-slate-700 px-1 rounded">/matches</code> command</li>
          <li>Click "View Your API" button at the bottom</li>
          <li>Your club ID is in the URL: <code className="bg-slate-700 px-1 rounded">clubId=XXXXX</code></li>
        </ol>
        <p className="text-slate-500 text-xs mt-2">
          Note: Only clubs using the OurProClub Discord bot will have data available.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6 sm:mb-10">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              placeholder="Enter club ID (e.g., 11247)"
              className="input"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !clubId.trim()}
            className="btn-primary px-6 sm:px-8"
          >
            {loading ? 'Loading...' : 'View Club'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <p className="font-semibold mb-1">Club not found</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading club data...</p>
          </div>
        </div>
      )}

      {/* Example Clubs */}
      {!loading && (
        <div className="max-w-2xl mx-auto">
          <h3 className="text-slate-400 text-sm mb-4">Example clubs to try:</h3>
          <div className="grid gap-3">
            {EXAMPLE_CLUBS.map((club) => (
              <button
                key={club.id}
                onClick={() => {
                  setClubId(club.id);
                  handleLookup(club.id);
                }}
                className="card p-4 card-hover flex items-center justify-between group text-left w-full"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-xl border border-cyan-500/20 flex-shrink-0">
                    ⚽
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                      {club.name}
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Club ID: {club.id}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClubSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    }>
      <ClubSearchContent />
    </Suspense>
  );
}
