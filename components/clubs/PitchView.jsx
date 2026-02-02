'use client';

export default function PitchView({ players, clubName }) {
  // Map position codes to pitch positions
  const positionMap = {
    'GK': { x: 50, y: 90 },
    'goalkeeper': { x: 50, y: 90 },
    'RB': { x: 85, y: 70 },
    'LB': { x: 15, y: 70 },
    'CB': { x: 40, y: 75 },
    'RCB': { x: 60, y: 75 },
    'LCB': { x: 40, y: 75 },
    'defender': { x: 50, y: 75 },
    'CDM': { x: 50, y: 55 },
    'RDM': { x: 65, y: 55 },
    'LDM': { x: 35, y: 55 },
    'CM': { x: 50, y: 45 },
    'RCM': { x: 65, y: 45 },
    'LCM': { x: 35, y: 45 },
    'RM': { x: 85, y: 45 },
    'LM': { x: 15, y: 45 },
    'midfielder': { x: 50, y: 45 },
    'CAM': { x: 50, y: 35 },
    'RAM': { x: 65, y: 35 },
    'LAM': { x: 35, y: 35 },
    'RW': { x: 85, y: 25 },
    'LW': { x: 15, y: 25 },
    'RF': { x: 65, y: 20 },
    'LF': { x: 35, y: 20 },
    'CF': { x: 50, y: 15 },
    'ST': { x: 50, y: 10 },
    'RS': { x: 60, y: 10 },
    'LS': { x: 40, y: 10 },
    'striker': { x: 50, y: 12 },
    'forward': { x: 50, y: 12 },
  };

  // Adjust positions to avoid overlap
  function getPlayerPositions(players) {
    const usedPositions = {};
    return players.map((player, index) => {
      const pos = player.favoritePosition || player.proPos || 'midfielder';
      let basePos = positionMap[pos] || positionMap['midfielder'];

      // Check for overlap and offset
      const key = `${basePos.x}-${basePos.y}`;
      if (usedPositions[key]) {
        usedPositions[key]++;
        basePos = {
          x: basePos.x + (usedPositions[key] % 2 === 0 ? 10 : -10),
          y: basePos.y + (usedPositions[key] > 2 ? 5 : 0)
        };
      } else {
        usedPositions[key] = 1;
      }

      return { ...player, position: basePos, displayPos: pos };
    });
  }

  const positionedPlayers = players ? getPlayerPositions(players.slice(0, 11)) : [];

  return (
    <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
      {/* Pitch Background */}
      <svg viewBox="0 0 100 130" className="w-full h-full">
        {/* Pitch Grass */}
        <rect x="0" y="0" width="100" height="130" fill="#1a472a" rx="2" />

        {/* Pitch Lines */}
        <g stroke="#2d5a3d" strokeWidth="0.5" fill="none">
          {/* Outline */}
          <rect x="5" y="5" width="90" height="120" />

          {/* Center Line */}
          <line x1="5" y1="65" x2="95" y2="65" />

          {/* Center Circle */}
          <circle cx="50" cy="65" r="12" />
          <circle cx="50" cy="65" r="0.5" fill="#2d5a3d" />

          {/* Penalty Areas */}
          <rect x="20" y="5" width="60" height="22" />
          <rect x="20" y="103" width="60" height="22" />

          {/* Goal Areas */}
          <rect x="32" y="5" width="36" height="8" />
          <rect x="32" y="117" width="36" height="8" />

          {/* Goals */}
          <rect x="38" y="2" width="24" height="3" strokeWidth="0.8" />
          <rect x="38" y="125" width="24" height="3" strokeWidth="0.8" />

          {/* Penalty Spots */}
          <circle cx="50" cy="17" r="0.5" fill="#2d5a3d" />
          <circle cx="50" cy="113" r="0.5" fill="#2d5a3d" />

          {/* Arcs */}
          <path d="M 38 27 A 12 12 0 0 0 62 27" />
          <path d="M 38 103 A 12 12 0 0 1 62 103" />

          {/* Corner Arcs */}
          <path d="M 5 8 A 3 3 0 0 0 8 5" />
          <path d="M 92 5 A 3 3 0 0 0 95 8" />
          <path d="M 5 122 A 3 3 0 0 1 8 125" />
          <path d="M 95 122 A 3 3 0 0 0 92 125" />
        </g>
      </svg>

      {/* Players */}
      <div className="absolute inset-0">
        {positionedPlayers.map((player, index) => (
          <div
            key={player.name || index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${player.position.x}%`,
              top: `${(player.position.y / 130) * 100}%`
            }}
          >
            {/* Player Marker */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white">
                {player.proOverall || '--'}
              </div>

              {/* Player Name Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg border border-slate-700">
                  <div className="font-semibold">{player.proName || player.name}</div>
                  <div className="text-slate-400 text-[10px]">{player.displayPos}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Club Name */}
      {clubName && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-900/80 px-3 py-1 rounded text-sm font-semibold text-white">
          {clubName}
        </div>
      )}
    </div>
  );
}
