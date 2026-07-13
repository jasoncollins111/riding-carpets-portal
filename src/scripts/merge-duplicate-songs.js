const path = require('path');
const dotenv = require('dotenv');
const { createScriptDb, getConnectionString } = require('./db');

const root = path.resolve(__dirname, '../..');

for (const file of ['.env', '.env.local', '.env.development.local']) {
  dotenv.config({ path: path.join(root, file), quiet: true });
}

function normalizeSongName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pickCanonical(rows) {
  return [...rows].sort((a, b) => {
    if (b.show_count !== a.show_count) return b.show_count - a.show_count;
    return a.id - b.id;
  })[0];
}

async function main() {
  if (!getConnectionString()) {
    console.error('Missing POSTGRES_URL.');
    process.exit(1);
  }

  const { sql, close } = createScriptDb();

  try {
    const playedSongs = await sql`
      SELECT s.id, s.song, COUNT(DISTINCT sl.show_id)::int AS show_count
      FROM songs s
      JOIN setlists sl ON sl.song_id = s.id
      GROUP BY s.id, s.song
      ORDER BY s.song ASC
    `;

    const groups = new Map();
    for (const row of playedSongs.rows) {
      const key = normalizeSongName(row.song);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }

    const duplicateGroups = [...groups.entries()].filter(([, rows]) => rows.length > 1);
    let mergedGroups = 0;
    let mergedRows = 0;
    let deletedSongs = 0;

    for (const [, rows] of duplicateGroups) {
      const canonical = pickCanonical(rows);
      const duplicates = rows.filter((row) => row.id !== canonical.id);
      if (!duplicates.length) continue;

      for (const duplicate of duplicates) {
        const updated = await sql`
          UPDATE setlists
          SET song_id = ${canonical.id}, song_name = ${canonical.song}
          WHERE song_id = ${duplicate.id}
        `;
        mergedRows += updated.rowCount;
        await sql`DELETE FROM songs WHERE id = ${duplicate.id}`;
        deletedSongs += 1;
        console.log(`Merged "${duplicate.song}" -> "${canonical.song}" (${updated.rowCount} setlist rows)`);
      }
      mergedGroups += 1;
    }

    console.log(`\nMerged ${mergedGroups} duplicate groups`);
    console.log(`Updated ${mergedRows} setlist rows`);
    console.log(`Deleted ${deletedSongs} duplicate song records`);

    const remaining = await sql`
      SELECT s.id, s.song, COUNT(DISTINCT sl.show_id)::int AS show_count
      FROM songs s
      JOIN setlists sl ON sl.song_id = s.id
      GROUP BY s.id, s.song
      ORDER BY s.song ASC
    `;

    const remainingGroups = new Map();
    for (const row of remaining.rows) {
      const key = normalizeSongName(row.song);
      if (!remainingGroups.has(key)) remainingGroups.set(key, []);
      remainingGroups.get(key).push(row);
    }

    const stillDuplicated = [...remainingGroups.entries()].filter(([, rows]) => rows.length > 1);

    const oddNames = await sql`
      SELECT s.id, s.song, COUNT(DISTINCT sl.show_id)::int AS show_count
      FROM songs s
      JOIN setlists sl ON sl.song_id = s.id
      GROUP BY s.id, s.song
      HAVING
        s.song ~ '[>]{1,2}' OR
        s.song ~ '^[0-9]' OR
        s.song ~ '^(1st|2nd|3rd|Set)' OR
        s.song = '????'
      ORDER BY show_count DESC, s.song ASC
    `;

    const catalogSize = await sql`SELECT COUNT(*)::int AS total FROM songs`;

    console.log(`\nCatalog size: ${catalogSize.rows[0].total} songs`);
    console.log(`Remaining duplicate groups: ${stillDuplicated.length}`);

    if (stillDuplicated.length) {
      for (const [normalized, rows] of stillDuplicated) {
        console.log(`\n"${normalized}"`);
        for (const row of rows) {
          console.log(`  - [id ${row.id}] "${row.song}" (${row.show_count} shows)`);
        }
      }
    }

    if (oddNames.rowCount) {
      console.log(`\nAnomalous song names still in setlists (${oddNames.rowCount}):`);
      for (const row of oddNames.rows) {
        console.log(`  - [id ${row.id}] "${row.song}" (${row.show_count} shows)`);
      }
    } else {
      console.log('\nNo anomalous song name patterns detected.');
    }
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error('Merge failed:', err);
  process.exit(1);
});
