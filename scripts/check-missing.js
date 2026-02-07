const db = require('../data/clubs-database.json');
const missing = [
  'APX FC', 'BD Boys FC', 'Blue Tigers', 'Chittagong FC',
  'CYTOS', 'De Southside', 'FiNiX', 'Genesis FC',
  'Guys At The Gig EFC', 'Infernal Direwolf', 'MV Unified Gaming',
  'Pinik Panthers', 'Sindoor FC', 'TN FC', 'Travancore Royals Elite'
];

console.log('Checking missing teams...\n');

const found = [];
const stillMissing = [];

missing.forEach(name => {
  // Try exact match first
  let match = db.clubs.find(c => c.name.toLowerCase() === name.toLowerCase());

  // Try fuzzy match if no exact match
  if (match === undefined) {
    const searchTerm = name.toLowerCase().replace(/ fc$| efc$/i, '').trim();
    match = db.clubs.find(c => {
      const clubName = c.name.toLowerCase();
      return clubName === searchTerm ||
             clubName.includes(searchTerm) ||
             searchTerm.includes(clubName.replace(/ fc$| efc$/i, '').trim());
    });
  }

  if (match) {
    console.log('✓ Found:', name, '→', match.name, '(' + match.id + ')');
    found.push({ search: name, ...match });
  } else {
    console.log('✗ Missing:', name);
    stillMissing.push(name);
  }
});

console.log('\n---');
console.log('Found:', found.length);
console.log('Still missing:', stillMissing.length);
console.log('\nDatabase total:', db.totalClubs, 'clubs');
