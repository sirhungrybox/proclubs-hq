const https = require('https');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'clubs-database.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
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

async function crawlClubs(seedClubs) {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const existingClubs = new Map(db.clubs.map(c => [c.id, c.name]));
  let totalNew = 0;

  console.log('Starting with', existingClubs.size, 'clubs\n');

  for (const clubId of seedClubs) {
    const url = 'https://api.ourproclub.app/api/match/history?clubId=' + clubId + '&limit=500';
    const matches = await fetch(url);

    if (!Array.isArray(matches) || matches.length === 0) {
      console.log(clubId + ': No data');
      continue;
    }

    let newCount = 0;
    matches.forEach(match => {
      if (match.club_id && match.club_name && !existingClubs.has(String(match.club_id))) {
        existingClubs.set(String(match.club_id), match.club_name);
        newCount++;
      }
      if (match.match_data && match.match_data.clubs) {
        Object.entries(match.match_data.clubs).forEach(([id, data]) => {
          if (data.clubName && !existingClubs.has(String(id))) {
            existingClubs.set(String(id), data.clubName);
            newCount++;
          }
        });
      }
    });

    const clubName = existingClubs.get(clubId) || 'Unknown';
    console.log(clubId + ' (' + clubName + '): +' + newCount + ' clubs from ' + matches.length + ' matches');
    totalNew += newCount;
    await sleep(100);
  }

  // Save
  const clubsArray = Array.from(existingClubs.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    lastUpdated: new Date().toISOString(),
    totalClubs: clubsArray.length,
    clubs: clubsArray
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(output, null, 2));
  console.log('\nTotal new clubs added:', totalNew);
  console.log('Database now has:', clubsArray.length, 'clubs');
}

// Get club IDs from command line or use defaults
const args = process.argv.slice(2);
if (args.length > 0) {
  crawlClubs(args);
} else {
  console.log('Usage: node add-clubs.js <clubId1> <clubId2> ...');
}
