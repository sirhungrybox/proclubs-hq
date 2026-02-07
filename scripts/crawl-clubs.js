const https = require('https');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'clubs-database.json');

function fetch(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function crawlClubs(clubIds) {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const existing = new Map(db.clubs.map(c => [c.id, c.name]));

  console.log('Starting with', existing.size, 'clubs');
  console.log('Fetching with limit=10000...\n');

  let totalNew = 0;

  for (const clubId of clubIds) {
    const url = 'https://api.ourproclub.app/api/match/history?clubId=' + clubId + '&limit=10000';
    console.log('Fetching:', clubId);

    const matches = await fetch(url);

    if (!Array.isArray(matches) || matches.length === 0) {
      console.log('  No data');
      await sleep(100);
      continue;
    }

    let newCount = 0;
    const clubName = matches[0]?.club_name || 'Unknown';

    matches.forEach(match => {
      if (match.club_id && match.club_name && !existing.has(String(match.club_id))) {
        existing.set(String(match.club_id), match.club_name);
        newCount++;
      }
      if (match.match_data && match.match_data.clubs) {
        Object.entries(match.match_data.clubs).forEach(([id, data]) => {
          if (data.clubName && !existing.has(String(id))) {
            existing.set(String(id), data.clubName);
            newCount++;
          }
        });
      }
    });

    console.log('  ' + clubName + ': +' + newCount + ' clubs from ' + matches.length + ' matches');
    totalNew += newCount;
    await sleep(100);
  }

  // Save
  const clubsArray = Array.from(existing.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(DB_PATH, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    totalClubs: clubsArray.length,
    clubs: clubsArray
  }, null, 2));

  console.log('\nTotal new clubs:', totalNew);
  console.log('Database now has:', clubsArray.length, 'clubs');
}

// Get club IDs from command line or use defaults
const args = process.argv.slice(2);
if (args.length > 0) {
  crawlClubs(args);
} else {
  // Default: crawl known active clubs
  crawlClubs(['68834', '10902', '27452', '1829854', '2568155', '2024883', '744852', '102687']);
}
