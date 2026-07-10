const path = require('path');
const dotenv = require('dotenv');
const config = require('./sheets-config.json');
const { createScriptDb, getConnectionString } = require('./db');
const {
  parseSetlistText,
  parseSheetDate,
  parseGvizDate,
  splitCityState,
  cellValue,
} = require('./parse-setlist');

const root = path.resolve(__dirname, '../..');

for (const file of ['.env', '.env.local', '.env.development.local']) {
  dotenv.config({ path: path.join(root, file), quiet: true });
}

let sql;

async function fetchSheetTab(sheetName) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || config.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}": ${res.status}`);
  }
  const text = await res.text();
  const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s);
  if (!match) throw new Error(`Invalid gviz response for sheet "${sheetName}"`);
  return JSON.parse(match[1]).table;
}

function rowToObject(cols, row) {
  const obj = {};
  cols.forEach((col, i) => {
    const label = col.label || '';
    if (label) obj[label] = row.c?.[i] ?? null;
  });
  return obj;
}

function getColumn(row, colName) {
  const cell = row[colName];
  if (!cell) return '';
  if (colName === config.columns.date) {
    return parseGvizDate(cell) || parseSheetDate(cellValue(cell)) || '';
  }
  return cellValue(cell).trim();
}

async function upsertShow(show) {
  const existing = await sql`
    SELECT id FROM shows WHERE date = ${show.date} AND venue = ${show.venue}
  `;

  if (existing.rowCount) {
    const showId = existing.rows[0].id;
    await sql`
      UPDATE shows
      SET city = ${show.city}, state = ${show.state}, notes = ${show.notes},
          lineup = ${show.lineup}, amount_earned = ${show.amount_earned}
      WHERE id = ${showId}
    `;
    return showId;
  }

  const inserted = await sql`
    INSERT INTO shows (date, venue, city, state, notes, lineup, amount_earned)
    VALUES (${show.date}, ${show.venue}, ${show.city}, ${show.state}, ${show.notes}, ${show.lineup}, ${show.amount_earned})
    RETURNING id
  `;
  return inserted.rows[0].id;
}

async function upsertSong(songName) {
  await sql`INSERT INTO songs (song) VALUES (${songName}) ON CONFLICT (song) DO NOTHING`;
  const result = await sql`SELECT id FROM songs WHERE song = ${songName}`;
  return result.rows[0].id;
}

async function replaceSetlist(showId, songs) {
  await sql`DELETE FROM setlists WHERE show_id = ${showId}`;

  for (const song of songs) {
    const songId = await upsertSong(song.song_name);
    await sql`
      INSERT INTO setlists (show_id, song_id, song_name, position, set_name, segue, minutes, seconds, footnote_refs)
      VALUES (
        ${showId}, ${songId}, ${song.song_name}, ${song.position},
        ${song.set_name}, ${song.segue}, ${song.minutes}, ${song.seconds}, ${song.footnote_refs}
      )
    `;
  }
}

async function importTab(sheetName) {
  console.log(`Importing tab: ${sheetName}`);
  const table = await fetchSheetTab(sheetName);
  const cols = table.cols;
  let imported = 0;
  let skipped = 0;

  for (const row of table.rows) {
    const data = rowToObject(cols, row);
    const venue = getColumn(data, config.columns.venue);
    const date = getColumn(data, config.columns.date);

    if (!venue || !date) {
      skipped++;
      continue;
    }

    const cityRaw = getColumn(data, config.columns.city);
    const { city, state } = splitCityState(cityRaw);
    const lineup = getColumn(data, config.columns.lineup) || null;
    const notes = getColumn(data, config.columns.notes) || null;
    const setlistRaw = getColumn(data, config.columns.setlist);
    const amountRaw = getColumn(data, config.columns.amountEarned);
    const amount_earned = amountRaw ? parseFloat(amountRaw.replace(/[^0-9.]/g, '')) || null : null;

    const songs = parseSetlistText(setlistRaw);
    if (!songs.length) {
      skipped++;
      continue;
    }

    const showId = await upsertShow({
      date,
      venue,
      city: city || cityRaw,
      state: state || '',
      notes,
      lineup,
      amount_earned,
    });

    await replaceSetlist(showId, songs);
    imported++;
  }

  console.log(`  ${sheetName}: ${imported} shows imported, ${skipped} rows skipped`);
  return imported;
}

async function main() {
  if (!getConnectionString()) {
    console.error('Missing POSTGRES_URL.');
    process.exit(1);
  }

  const db = createScriptDb();
  sql = db.sql;

  try {
    console.log('Starting Google Sheets import...');
    let total = 0;

    for (const tab of config.yearTabs) {
      try {
        total += await importTab(tab);
      } catch (err) {
        console.error(`  Error on tab ${tab}:`, err.message);
      }
    }

    console.log(`Import complete. ${total} shows total.`);
  } finally {
    await db.close();
  }
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
