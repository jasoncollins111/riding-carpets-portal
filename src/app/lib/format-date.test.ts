import { describe, it, expect } from 'vitest';
import { formatDate, formatLongDate, formatShortDate } from './format-date';

describe('formatDate', () => {
  it('formats ISO date strings without timezone shift', () => {
    expect(formatDate('2024-08-24')).toBe('08/24/2024');
    expect(formatDate('2024-06-01')).toBe('06/01/2024');
  });

  it('formats Postgres timestamp strings using the calendar date', () => {
    expect(formatDate('2024-08-24T00:00:00.000Z')).toBe('08/24/2024');
    expect(formatDate('2026-01-10T00:00:00.000Z')).toBe('01/10/2026');
  });
});

describe('formatLongDate', () => {
  it('formats long dates without timezone shift', () => {
    expect(formatLongDate('2024-08-24T00:00:00.000Z')).toBe('August 24, 2024');
    expect(formatLongDate('2021-11-27')).toBe('November 27, 2021');
  });
});

describe('formatShortDate', () => {
  it('formats short dates without timezone shift', () => {
    expect(formatShortDate('2024-08-24T00:00:00.000Z')).toBe('Aug 24, 2024');
  });
});
