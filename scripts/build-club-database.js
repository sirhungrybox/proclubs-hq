const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'clubs-database.json');
const DELAY_MS = 100; // Delay between requests to avoid rate limiting

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractClubsFromMatches(clubId) {
  const url = `https://api.ourproclub.app/api/match/history?clubId=${clubId}&limit=500`;
  const matches = await fetch(url);
  const clubs = new Map();

  if (!Array.isArray(matches)) return clubs;

  matches.forEach(match => {
    // Main club
    if (match.club_id && match.club_name) {
      clubs.set(String(match.club_id), match.club_name);
    }

    // Opponent clubs from match_data
    if (match.match_data && match.match_data.clubs) {
      Object.entries(match.match_data.clubs).forEach(([id, data]) => {
        if (data.clubName) {
          clubs.set(String(id), data.clubName);
        }
      });
    }
  });

  return clubs;
}

async function buildDatabase() {
  const allClubs = new Map();
  const processedClubs = new Set();
  const toProcess = ['11247', '34771', '270983', '3183716']; // Seed clubs

  console.log('Starting club database build...\n');

  let iteration = 0;
  const maxIterations = 50; // Limit iterations to avoid infinite crawling

  while (toProcess.length > 0 && iteration < maxIterations) {
    const clubId = toProcess.shift();

    if (processedClubs.has(clubId)) continue;
    processedClubs.add(clubId);

    console.log(`[${iteration + 1}] Processing club ${clubId} (${allClubs.get(clubId) || 'Unknown'})...`);

    const clubs = await extractClubsFromMatches(clubId);

    let newClubs = 0;
    clubs.forEach((name, id) => {
      if (!allClubs.has(id)) {
        allClubs.set(id, name);
        newClubs++;

        // Add to processing queue if not already processed
        if (!processedClubs.has(id) && !toProcess.includes(id)) {
          toProcess.push(id);
        }
      }
    });

    console.log(`   Found ${clubs.size} clubs, ${newClubs} new. Total: ${allClubs.size}`);

    iteration++;
    await sleep(DELAY_MS);
  }

  // Convert to sorted array
  const clubsArray = Array.from(allClubs.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Save to file
  const output = {
    lastUpdated: new Date().toISOString(),
    totalClubs: clubsArray.length,
    clubs: clubsArray
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n✓ Database saved to ${OUTPUT_FILE}`);
  console.log(`✓ Total clubs: ${clubsArray.length}`);
  console.log(`✓ Processed ${processedClubs.size} clubs' match histories`);
}

buildDatabase().catch(console.error);
