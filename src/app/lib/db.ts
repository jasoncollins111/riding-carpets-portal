import { Pool, QueryResult, QueryResultRow } from 'pg';

declare global {
  var pgPool: Pool | undefined;
}

const CONNECTION_ERROR_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  '57P01',
  '08006',
  '08003',
  '08001',
]);

const CONNECTION_ENV_KEYS = [
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'DATABASE_URL',
  'PRISMA_DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
] as const;

function isValidConnectionString(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://');
}

export function getConnectionString(): string {
  for (const key of CONNECTION_ENV_KEYS) {
    const value = process.env[key];
    if (isValidConnectionString(value)) {
      return value.trim();
    }
  }

  throw new Error(
    'Missing database URL. Set POSTGRES_PRISMA_URL, POSTGRES_URL, or DATABASE_URL.',
  );
}

function resetPool() {
  if (global.pgPool) {
    global.pgPool.end().catch(() => {});
    global.pgPool = undefined;
  }
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string };
  if (err.code && CONNECTION_ERROR_CODES.has(err.code)) return true;
  const message = err.message?.toLowerCase() ?? '';
  return (
    message.includes('connection terminated') ||
    message.includes('connection timeout') ||
    message.includes('too many connections')
  );
}

function getPool(): Pool {
  if (!global.pgPool) {
    global.pgPool = new Pool({
      connectionString: getConnectionString(),
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    global.pgPool.on('error', (err) => {
      console.error('Postgres pool error:', err);
      resetPool();
    });
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

  try {
    return await getPool().query<T>(text, values);
  } catch (error) {
    if (!isConnectionError(error)) throw error;
    console.error('Postgres connection error, retrying once:', error);
    resetPool();
    return getPool().query<T>(text, values);
  }
}
