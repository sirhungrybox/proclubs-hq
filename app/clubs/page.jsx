'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PLATFORM_LABELS } from '@/lib/ea-api';

function ClubSearchContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialPlatform = searchParams.get('platform') || 'ps5';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [platform, setPlatform] = useState(initialPlatform);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialSearch) {
      performSearch(initialSearch, initialPlatform);
    }
  }, []);

  async function performSearch(query, plat) {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/ea/clubs/search?name=${encodeURIComponent(query)}&platform=${plat}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setClubs(data.clubs || []);
    } catch (err) {
      setError(err.message);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    performSearch(searchQuery, platform);
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
        <h1 className="text-2xl sm:text-4xl font-bold font-display gradient-text mb-2 sm:mb-3">Club Search</h1>
        <p className="text-sm sm:text-base text-slate-400">Find any Pro Clubs team and view their stats</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 sm:mb-10">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter club name..."
              className="input"
            />
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="input sm:w-48"
          >
            {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="btn-primary px-6 sm:px-8"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Searching clubs...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="max-w-4xl mx-auto">
          {clubs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No clubs found</h3>
              <p className="text-slate-500">Try a different search term or platform</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <p className="text-slate-400 text-sm">{clubs.length} club{clubs.length !== 1 ? 's' : ''} found</p>
              {clubs.map((club) => (
                <Link
                  key={club.clubId}
                  href={`/clubs/${club.clubId}?platform=${platform}`}
                  className="card p-4 sm:p-6 card-hover flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-xl sm:text-2xl border border-cyan-500/20 flex-shrink-0">
                      ⚽
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {club.name}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        Club ID: {club.clubId}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Search for a club</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Enter a club name above to search for Pro Clubs teams and view their detailed statistics
          </p>
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
