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

async function main() {
  if (!getConnectionString()) {
    console.error('Missing POSTGRES_URL.');
    process.exit(1);
  }

  const { sql, close } = createScriptDb();

  try {
    const before = await sql`
      SELECT COUNT(*)::int AS total FROM songs
    `;
    console.log(`Catalog before cleanup: ${before.rows[0].total} songs`);

    const orphans = await sql`
      SELECT s.id, s.song
      FROM songs s
      WHERE NOT EXISTS (
        SELECT 1 FROM setlists sl WHERE sl.song_id = s.id
      )
      ORDER BY s.song ASC
    `;

    console.log(`\nRemoving ${orphans.rowCount} orphan songs (not in any setlist)...`);
    if (orphans.rowCount) {
      const orphanIds = orphans.rows.map((row) => row.id);
      await sql`DELETE FROM songs WHERE id = ANY(${orphanIds})`;
      console.log('Deleted orphans:');
      for (const row of orphans.rows) {
        console.log(`  - ${row.song}`);
      }
    }

    const after = await sql`
      SELECT COUNT(*)::int AS total FROM songs
    `;
    console.log(`\nCatalog after cleanup: ${after.rows[0].total} songs`);

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
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(row);
    }

    const duplicateGroups = [...groups.entries()]
      .filter(([, rows]) => rows.length > 1)
      .sort((a, b) => a[0].localeCompare(b[0]));

    console.log(`\nRemaining duplicate groups in active setlists: ${duplicateGroups.length}`);

    if (!duplicateGroups.length) {
      console.log('None — all active song names are unique.');
      return;
    }

    for (const [normalized, rows] of duplicateGroups) {
      console.log(`\n"${normalized}"`);
      for (const row of rows) {
        console.log(`  - [id ${row.id}] "${row.song}" (${row.show_count} shows)`);
      }
    }

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

    if (oddNames.rowCount) {
      console.log(`\nOther anomalous song names still in setlists (${oddNames.rowCount}):`);
      for (const row of oddNames.rows) {
        console.log(`  - [id ${row.id}] "${row.song}" (${row.show_count} shows)`);
      }
    }
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
