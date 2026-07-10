import { afterEach, describe, expect, it } from 'vitest';
import { getConnectionString } from './db';

const ENV_KEYS = [
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'DATABASE_URL',
  'PRISMA_DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
] as const;

describe('getConnectionString', () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it('prefers the pooled Vercel Postgres URL for runtime queries', () => {
    process.env.POSTGRES_PRISMA_URL = 'postgres://pooled';
    process.env.POSTGRES_URL = 'postgres://direct-ish';
    process.env.POSTGRES_URL_NON_POOLING = 'postgres://non-pooling';

    expect(getConnectionString()).toBe('postgres://pooled');
  });

  it('falls back through known database env vars', () => {
    process.env.DATABASE_URL = 'postgres://database';

    expect(getConnectionString()).toBe('postgres://database');
  });

  it('throws when no database URL is configured', () => {
    expect(() => getConnectionString()).toThrow(/Missing database URL/);
  });
});
