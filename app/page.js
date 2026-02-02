'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLATFORM_LABELS } from '@/lib/ea-api';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState('ps5');
  const [loading, setLoading] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      router.push(`/clubs?search=${encodeURIComponent(searchQuery)}&platform=${platform}`);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <span className="text-6xl">⚽</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-display mb-4">
          <span className="gradient-text">PRO CLUBS</span>
          <span className="text-white"> HQ</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto">
          Search any EA FC 26 Pro Clubs team and explore detailed match stats, player performance, and tactical insights
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl px-4">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter club name..."
              className="input text-lg py-4"
              autoFocus
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="input flex-1"
              >
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="btn-primary px-12 py-3 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </span>
                ) : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Features Preview */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto px-4">
        <div>
          <div className="text-3xl mb-2">📊</div>
          <p className="text-slate-400 text-sm">Match Stats</p>
        </div>
        <div>
          <div className="text-3xl mb-2">🏟️</div>
          <p className="text-slate-400 text-sm">Pitch Reports</p>
        </div>
        <div>
          <div className="text-3xl mb-2">👥</div>
          <p className="text-slate-400 text-sm">Player Analysis</p>
        </div>
      </div>
    </div>
  );
}
