'use client';

// Position mapping for EA FC positions (1-14)
const POSITION_COORDS = {
  0: { x: 50, y: 92, label: 'GK' },    // Goalkeeper
  1: { x: 50, y: 92, label: 'GK' },    // Goalkeeper
  2: { x: 20, y: 72, label: 'LB' },    // Left Back
  3: { x: 35, y: 75, label: 'LCB' },   // Left Center Back
  4: { x: 65, y: 75, label: 'RCB' },   // Right Center Back
  5: { x: 80, y: 72, label: 'RB' },    // Right Back
  6: { x: 35, y: 55, label: 'LDM' },   // Left Defensive Mid
  7: { x: 50, y: 55, label: 'CDM' },   // Center Defensive Mid
  8: { x: 65, y: 55, label: 'RDM' },   // Right Defensive Mid
  9: { x: 20, y: 42, label: 'LM' },    // Left Mid
  10: { x: 35, y: 42, label: 'LCM' },  // Left Center Mid
  11: { x: 50, y: 42, label: 'CM' },   // Center Mid
  12: { x: 65, y: 42, label: 'RCM' },  // Right Center Mid
  13: { x: 80, y: 42, label: 'RM' },   // Right Mid
  14: { x: 50, y: 32, label: 'CAM' },  // Center Attacking Mid
  15: { x: 35, y: 32, label: 'LAM' },  // Left Attacking Mid
  16: { x: 65, y: 32, label: 'RAM' },  // Right Attacking Mid
  17: { x: 20, y: 22, label: 'LW' },   // Left Wing
  18: { x: 35, y: 18, label: 'LF' },   // Left Forward
  19: { x: 50, y: 15, label: 'ST' },   // Striker
  20: { x: 65, y: 18, label: 'RF' },   // Right Forward
  21: { x: 80, y: 22, label: 'RW' },   // Right Wing
  22: { x: 40, y: 12, label: 'LS' },   // Left Striker
  23: { x: 60, y: 12, label: 'RS' },   // Right Striker
  24: { x: 50, y: 10, label: 'CF' },   // Center Forward
};

// Archetype to position type mapping
const ARCHETYPE_POSITIONS = {
  'Shot Stopper': 'GK',
  'Sweeper Keeper': 'GK',
  'Progressor': 'DEF',
  'Boss': 'DEF',
  'Engine': 'MID',
  'Marauder': 'DEF',
  'Recycler': 'MID',
  'Maestro': 'MID',
  'Creator': 'MID',
  'Spark': 'FWD',
  'Magician': 'MID',
  'Finisher': 'FWD',
  'Target': 'FWD',
};

function getRatingColor(rating) {
  if (rating >= 8.5) return 'from-emerald-400 to-green-500';
  if (rating >= 8.0) return 'from-green-400 to-green-500';
  if (rating >= 7.5) return 'from-cyan-400 to-cyan-500';
  if (rating >= 7.0) return 'from-blue-400 to-blue-500';
  if (rating >= 6.5) return 'from-yellow-400 to-yellow-500';
  if (rating >= 6.0) return 'from-orange-400 to-orange-500';
  return 'from-red-400 to-red-500';
}

function getRatingBg(rating) {
  if (rating >= 8.0) return 'bg-green-500/20 text-green-400 border-green-500/40';
  if (rating >= 7.0) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
  if (rating >= 6.0) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
  return 'bg-red-500/20 text-red-400 border-red-500/40';
}

export default function MatchPitchView({ players, showStats = true }) {
  if (!players || players.length === 0) {
    return null;
  }

  // Assign positions to players, avoiding overlaps
  const usedPositions = new Map();
  const positionedPlayers = players.map((player, index) => {
    const pos = parseInt(player.position) || 0;
    let coords = POSITION_COORDS[pos] || POSITION_COORDS[11]; // Default to CM

    // Handle position collisions
    const key = `${coords.x}-${coords.y}`;
    const count = usedPositions.get(key) || 0;
    usedPositions.set(key, count + 1);

    if (count > 0) {
      coords = {
        ...coords,
        x: coords.x + (count % 2 === 0 ? 12 : -12) * Math.ceil(count / 2),
        y: coords.y + (count > 2 ? 5 : 0),
      };
    }

    return {
      ...player,
      coords,
    };
  });

  return (
    <div className="relative w-full">
      {/* Pitch SVG */}
      <div className="relative w-full aspect-[4/5] max-w-lg mx-auto">
        <svg viewBox="0 0 100 120" className="w-full h-full">
          {/* Pitch Background */}
          <defs>
            <pattern id="grass" patternUnits="userSpaceOnUse" width="10" height="10">
              <rect width="10" height="10" fill="#1a472a" />
              <rect width="5" height="10" fill="#1e5230" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="120" fill="url(#grass)" rx="3" />

          {/* Pitch Lines */}
          <g stroke="#2d6e3f" strokeWidth="0.4" fill="none">
            {/* Outline */}
            <rect x="5" y="5" width="90" height="110" />

            {/* Center Line */}
            <line x1="5" y1="60" x2="95" y2="60" />

            {/* Center Circle */}
            <circle cx="50" cy="60" r="10" />
            <circle cx="50" cy="60" r="0.8" fill="#2d6e3f" />

            {/* Penalty Areas */}
            <rect x="22" y="5" width="56" height="18" />
            <rect x="22" y="97" width="56" height="18" />

            {/* Goal Areas */}
            <rect x="34" y="5" width="32" height="7" />
            <rect x="34" y="108" width="32" height="7" />

            {/* Goals */}
            <rect x="40" y="2" width="20" height="3" strokeWidth="0.6" />
            <rect x="40" y="115" width="20" height="3" strokeWidth="0.6" />

            {/* Penalty Spots */}
            <circle cx="50" cy="15" r="0.6" fill="#2d6e3f" />
            <circle cx="50" cy="105" r="0.6" fill="#2d6e3f" />

            {/* Penalty Arcs */}
            <path d="M 40 23 A 8 8 0 0 0 60 23" />
            <path d="M 40 97 A 8 8 0 0 1 60 97" />

            {/* Corner Arcs */}
            <path d="M 5 7 A 2 2 0 0 0 7 5" />
            <path d="M 93 5 A 2 2 0 0 0 95 7" />
            <path d="M 5 113 A 2 2 0 0 1 7 115" />
            <path d="M 95 113 A 2 2 0 0 0 93 115" />
          </g>
        </svg>

        {/* Players overlay */}
        <div className="absolute inset-0">
          {positionedPlayers.map((player, index) => (
            <div
              key={player.name || index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{
                left: `${player.coords.x}%`,
                top: `${(player.coords.y / 120) * 100}%`,
              }}
            >
              {/* Player marker with rating */}
              <div className="relative">
                {/* MOTM glow */}
                {player.manOfTheMatch && (
                  <div className="absolute -inset-1 bg-yellow-400/40 rounded-full blur-sm animate-pulse" />
                )}

                {/* Rating circle */}
                <div
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${getRatingColor(player.rating)} flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg border-2 border-white/80`}
                >
                  {player.rating?.toFixed(1) || '-'}
                </div>

                {/* Goals/Assists badges */}
                <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                  {player.goals > 0 && (
                    <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[9px] font-bold text-slate-900 shadow">
                      {player.goals}
                    </span>
                  )}
                  {player.assists > 0 && (
                    <span className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-900 shadow">
                      {player.assists}
                    </span>
                  )}
                </div>

                {/* MOTM star */}
                {player.manOfTheMatch && (
                  <span className="absolute -top-1 -right-1 text-yellow-400 text-sm drop-shadow-lg">⭐</span>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="bg-slate-900/95 backdrop-blur px-3 py-2 rounded-lg text-xs text-white shadow-xl border border-slate-700 min-w-[140px]">
                    <div className="font-semibold text-sm mb-1">{player.name}</div>
                    <div className="text-slate-400 text-[10px] mb-2">{player.archetype}</div>
                    {showStats && (
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pass Acc</span>
                          <span className="text-white font-medium">
                            {player.passAttempts > 0
                              ? Math.round((player.passesMade / player.passAttempts) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Passes</span>
                          <span className="text-white">{player.passesMade}/{player.passAttempts}</span>
                        </div>
                        {player.shots > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Shots</span>
                            <span className="text-white">{player.shots}</span>
                          </div>
                        )}
                        {player.tacklesMade > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tackles</span>
                            <span className="text-white">{player.tacklesMade}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white rounded-full"></span> Goals
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-cyan-400 rounded-full"></span> Assists
          </span>
        </div>
      </div>
    </div>
  );
}
