import { describe, it, expect } from 'vitest';
import {
  parseShowId,
  hasSetlistSongs,
  isNonEmptyString,
  validateSetlistItems,
} from './validation';

describe('parseShowId', () => {
  it('returns null for missing or invalid ids', () => {
    expect(parseShowId(null)).toBeNull();
    expect(parseShowId('')).toBeNull();
    expect(parseShowId('abc')).toBeNull();
  });

  it('returns parsed integer for valid ids', () => {
    expect(parseShowId('42')).toBe(42);
  });
});

describe('hasSetlistSongs', () => {
  it('returns false when all sets are empty', () => {
    expect(hasSetlistSongs({ 'Set One': [], Encore: [] })).toBe(false);
  });

  it('returns true when any set has songs', () => {
    expect(
      hasSetlistSongs({
        'Set One': [{ song_name: 'Terrapin' }],
        Encore: [],
      }),
    ).toBe(true);
  });
});

describe('isNonEmptyString', () => {
  it('rejects empty or whitespace strings', () => {
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });

  it('accepts non-empty strings', () => {
    expect(isNonEmptyString('Red Rocks')).toBe(true);
  });
});

describe('validateSetlistItems', () => {
  it('returns null for invalid input', () => {
    expect(validateSetlistItems(null)).toBeNull();
    expect(validateSetlistItems([])).toBeNull();
    expect(validateSetlistItems([{ song_name: '' }])).toBeNull();
  });

  it('returns items for valid setlist arrays', () => {
    const items = [{ song_name: 'Shakedown' }, { song_name: 'Scarlet' }];
    expect(validateSetlistItems(items)).toEqual(items);
  });
});
