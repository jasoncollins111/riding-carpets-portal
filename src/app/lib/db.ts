import { Pool, QueryResult, QueryResultRow } from 'pg';

declare global {
  var pgPool: Pool | undefined;
}

function getConnectionString(): string {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Missing POSTGRES_URL or DATABASE_URL');
  }

  return connectionString;
}

function getPool(): Pool {
  if (!global.pgPool) {
    global.pgPool = new Pool({ connectionString: getConnectionString() });
  }
  return global.pgPool;
}

export async function sql<T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<QueryResult<T>> {
  let text = strings[0] ?? '';
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}${strings[i + 1] ?? ''}`;
  }
  return getPool().query<T>(text, values);
}
