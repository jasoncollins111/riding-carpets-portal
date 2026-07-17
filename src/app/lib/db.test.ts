import { afterEach, describe, expect, it } from 'vitest';
import { getConnectionCandidates, getConnectionString } from './db';

const ENV_KEYS = [
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'DATABASE_URL',
  'PRISMA_DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_HOST',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
] as const;

describe('getConnectionString', () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it('prefers POSTGRES_URL for runtime queries', () => {
    process.env.POSTGRES_PRISMA_URL = 'postgres://prisma';
    process.env.POSTGRES_URL = 'postgres://direct';
    process.env.POSTGRES_URL_NON_POOLING = 'postgres://non-pooling';

    expect(getConnectionString()).toBe('postgres://direct');
  });

  it('skips empty or placeholder env values', () => {
    process.env.POSTGRES_PRISMA_URL = '""';
    process.env.POSTGRES_URL = '';
    process.env.DATABASE_URL = 'postgresql://database';

    expect(getConnectionString()).toBe('postgresql://database');
  });

  it('strips surrounding quotes and prisma prefixes', () => {
    process.env.POSTGRES_URL = '"prisma+postgresql://quoted"';

    expect(getConnectionString()).toBe('postgresql://quoted');
  });

  it('builds a connection string from Vercel Postgres parts', () => {
    process.env.POSTGRES_HOST = 'db.example.com';
    process.env.POSTGRES_USER = 'user';
    process.env.POSTGRES_PASSWORD = 'p@ss';
    process.env.POSTGRES_DATABASE = 'verceldb';

    expect(getConnectionString()).toBe(
      'postgresql://user:p%40ss@db.example.com/verceldb?sslmode=require',
    );
  });

  it('falls back through known database env vars', () => {
    process.env.DATABASE_URL = 'postgres://database';

    expect(getConnectionString()).toBe('postgres://database');
  });

  it('throws when no database URL is configured', () => {
    expect(() => getConnectionString()).toThrow(/Missing database URL/);
    expect(getConnectionCandidates()).toEqual([]);
  });

  it('returns all unique connection candidates in priority order', () => {
    process.env.POSTGRES_PRISMA_URL = 'postgres://pooled';
    process.env.POSTGRES_URL = 'postgres://direct';
    process.env.POSTGRES_URL_NON_POOLING = 'postgres://direct';

    expect(getConnectionCandidates()).toEqual([
      { source: 'POSTGRES_URL', url: 'postgres://direct' },
      { source: 'POSTGRES_PRISMA_URL', url: 'postgres://pooled' },
    ]);
  });
});
