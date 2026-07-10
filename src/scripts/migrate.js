const path = require('path');
const dotenv = require('dotenv');
const { createScriptDb, getConnectionString } = require('./db');

const root = path.resolve(__dirname, '../..');

for (const file of ['.env', '.env.local', '.env.development.local']) {
  dotenv.config({ path: path.join(root, file), quiet: true });
}

async function migrate() {
  if (!getConnectionString()) {
    console.error(
      'Missing POSTGRES_URL. Add it to .env or .env.development.local in the project root.',
    );
    process.exit(1);
  }

  const { sql, close } = createScriptDb();

  try {
    console.log('Running database migrations...');

    await sql`
      CREATE TABLE IF NOT EXISTS shows (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        venue VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL,
        notes TEXT,
        lineup TEXT,
        amount_earned NUMERIC
      );
    `;

    await sql`ALTER TABLE shows ADD COLUMN IF NOT EXISTS lineup TEXT;`;
    await sql`ALTER TABLE shows ADD COLUMN IF NOT EXISTS amount_earned NUMERIC;`;

    await sql`
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        song VARCHAR(255) NOT NULL UNIQUE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS setlists (
        show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
        song_name VARCHAR(255) NOT NULL,
        position INTEGER NOT NULL,
        set_name VARCHAR(50),
        segue BOOLEAN DEFAULT false,
        minutes INTEGER,
        seconds INTEGER,
        footnote_refs VARCHAR(50),
        PRIMARY KEY (show_id, position)
      );
    `;

    await sql`ALTER TABLE setlists ADD COLUMN IF NOT EXISTS position INTEGER;`;
    await sql`ALTER TABLE setlists ADD COLUMN IF NOT EXISTS set_name VARCHAR(50);`;
    await sql`ALTER TABLE setlists ADD COLUMN IF NOT EXISTS segue BOOLEAN DEFAULT false;`;
    await sql`ALTER TABLE setlists ADD COLUMN IF NOT EXISTS minutes INTEGER;`;
    await sql`ALTER TABLE setlists ADD COLUMN IF NOT EXISTS seconds INTEGER;`;
    await sql`ALTER TABLE setlists ADD COLUMN IF NOT EXISTS footnote_refs VARCHAR(50);`;

    await sql`
      UPDATE setlists s
      SET position = sub.rn
      FROM (
        SELECT show_id, song_id, ROW_NUMBER() OVER (PARTITION BY show_id ORDER BY song_id) AS rn
        FROM setlists
        WHERE position IS NULL
      ) sub
      WHERE s.show_id = sub.show_id AND s.song_id = sub.song_id AND s.position IS NULL;
    `;

    await sql`ALTER TABLE setlists DROP CONSTRAINT IF EXISTS setlists_pkey;`;
    await sql`ALTER TABLE setlists DROP CONSTRAINT IF EXISTS setlists_pk;`;
    await sql`
      ALTER TABLE setlists ADD CONSTRAINT setlists_pkey PRIMARY KEY (show_id, position);
    `;

    console.log('Migrations complete.');
  } finally {
    await close();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
