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
  '53300',
]);

const CONNECTION_ENV_KEYS = [
  'POSTGRES_URL',
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'PRISMA_DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
] as const;

function normalizeConnectionString(value: string | undefined): string | null {
  if (!value) return null;

  let trimmed = value.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") return null;

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  if (trimmed.startsWith('prisma+')) {
    trimmed = trimmed.slice('prisma+'.length);
  }

  if (
    trimmed.startsWith('postgres://') ||
    trimmed.startsWith('postgresql://')
  ) {
    return trimmed;
  }

  return null;
}

function connectionStringFromParts(): string | null {
  const host = process.env.POSTGRES_HOST?.trim();
  const user = process.env.POSTGRES_USER?.trim();
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE?.trim();

  if (!host || !user || !password || !database) return null;

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
}

function ensureConnectionParams(url: string): string {
  let connectionString = url;

  if (!connectionString.includes('sslmode=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString = `${connectionString}${separator}sslmode=require`;
  }

  if (
    connectionString.includes('pooler') ||
    connectionString.includes('pgbouncer=true')
  ) {
    if (!connectionString.includes('pgbouncer=true')) {
      connectionString = `${connectionString}&pgbouncer=true`;
    }
  }

  return connectionString;
}

export function getConnectionCandidates(): { source: string; url: string }[] {
  const candidates: { source: string; url: string }[] = [];
  const seen = new Set<string>();

  for (const key of CONNECTION_ENV_KEYS) {
    const normalized = normalizeConnectionString(process.env[key]);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      candidates.push({ source: key, url: normalized });
    }
  }

  const fromParts = connectionStringFromParts();
  if (fromParts && !seen.has(fromParts)) {
    candidates.push({ source: 'POSTGRES_PARTS', url: fromParts });
  }

  return candidates;
}

export function getConnectionDiagnostics() {
  const candidates = getConnectionCandidates();
  return {
    candidateCount: candidates.length,
    sources: candidates.map((candidate) => candidate.source),
    envKeysPresent: Object.fromEntries(
      CONNECTION_ENV_KEYS.map((key) => [key, Boolean(process.env[key])]),
    ),
    hasPostgresParts: Boolean(
      process.env.POSTGRES_HOST &&
        process.env.POSTGRES_USER &&
        process.env.POSTGRES_PASSWORD &&
        process.env.POSTGRES_DATABASE,
    ),
  };
}

export function getConnectionString(): string {
  const candidates = getConnectionCandidates();
  if (!candidates.length) {
    throw new Error(
      'Missing database URL. Set POSTGRES_PRISMA_URL, POSTGRES_URL, or DATABASE_URL.',
    );
  }

  return candidates[0].url;
}

let activeConnectionSource: string | null = null;

function resetPool() {
  if (global.pgPool) {
    global.pgPool.end().catch(() => {});
    global.pgPool = undefined;
  }
  activeConnectionSource = null;
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string };
  if (err.code && CONNECTION_ERROR_CODES.has(err.code)) return true;
  const message = err.message?.toLowerCase() ?? '';
  return (
    message.includes('connection terminated') ||
    message.includes('connection timeout') ||
    message.includes('too many connections') ||
    message.includes('missing database url') ||
    message.includes('password authentication failed') ||
    message.includes('getaddrinfo') ||
    message.includes('econnrefused')
  );
}

function createPool(connectionString: string): Pool {
  const pool = new Pool({
    connectionString: ensureConnectionParams(connectionString),
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
  });

  try {
    const { attachDatabasePool } = require('@vercel/functions');
    attachDatabasePool(pool);
  } catch (error) {
    console.error('attachDatabasePool unavailable:', error);
  }

  pool.on('error', (err) => {
    console.error('Postgres pool error:', err);
    resetPool();
  });

  return pool;
}

function getPoolForCandidate(source: string, url: string): Pool {
  if (global.pgPool && activeConnectionSource === source) {
    return global.pgPool;
  }

  resetPool();
  activeConnectionSource = source;
  global.pgPool = createPool(url);
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

  const candidates = getConnectionCandidates();
  if (!candidates.length) {
    throw new Error(
      'Missing database URL. Set POSTGRES_PRISMA_URL, POSTGRES_URL, or DATABASE_URL.',
    );
  }

  let lastError: unknown;

  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index];
    try {
      const pool = getPoolForCandidate(candidate.source, candidate.url);
      return await pool.query<T>(text, values);
    } catch (error) {
      lastError = error;
      if (!isConnectionError(error) || index === candidates.length - 1) {
        throw error;
      }
      console.error(
        `Postgres connection error using ${candidate.source}, trying fallback:`,
        error,
      );
      resetPool();
    }
  }

  throw lastError;
}
