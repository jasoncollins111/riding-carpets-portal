const { Pool } = require('pg');

function getConnectionString() {
  return (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.PRISMA_DATABASE_URL
  );
}

function createScriptDb() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('Missing POSTGRES_URL or DATABASE_URL.');
  }

  const pool = new Pool({ connectionString });

  async function sql(strings, ...values) {
    let text = strings[0] ?? '';
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}${strings[i + 1] ?? ''}`;
    }
    return pool.query(text, values);
  }

  async function close() {
    await pool.end();
  }

  return { sql, close };
}

module.exports = { createScriptDb, getConnectionString };
