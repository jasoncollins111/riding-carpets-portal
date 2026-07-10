import { describe, it, expect } from 'vitest';
import {
  parseSetlistText,
  parseSheetDate,
  splitCityState,
  normalizeSetName,
} from './parse-setlist.js';

describe('parseSheetDate', () => {
  it('parses M/D/YY dates', () => {
    expect(parseSheetDate('1/14/22')).toBe('2022-01-14');
    expect(parseSheetDate('04/30/22')).toBe('2022-04-30');
    expect(parseSheetDate('01/14/23')).toBe('2023-01-14');
  });
});

describe('splitCityState', () => {
  it('splits city and state', () => {
    expect(splitCityState('Denver, CO')).toEqual({ city: 'Denver', state: 'CO' });
    expect(splitCityState('Golden, CO')).toEqual({ city: 'Golden', state: 'CO' });
  });
});

describe('normalizeSetName', () => {
  it('normalizes set headers', () => {
    expect(normalizeSetName('Set I')).toBe('Set I');
    expect(normalizeSetName('Set II')).toBe('Set II');
    expect(normalizeSetName('E:')).toBe('Encore');
  });
});

describe('parseSetlistText', () => {
  it('parses plain list (Moes Bbq 1/14/22)', () => {
    const text = `Under the Big Top
Mating Season
DasFut
Syzygy`;
    const songs = parseSetlistText(text);
    expect(songs).toHaveLength(4);
    expect(songs[0].song_name).toBe('Under the Big Top');
    expect(songs[0].position).toBe(1);
    expect(songs[0].set_name).toBeNull();
  });

  it('parses footnotes and segues (So Many Roads 04/30/22)', () => {
    const text = `Deal[1] 
The Valley 
China Cat Sunflower[1] --> 
Sand[3] -->
Wilder`;
    const songs = parseSetlistText(text);
    expect(songs).toHaveLength(5);
    expect(songs[0].song_name).toBe('Deal');
    expect(songs[0].footnote_refs).toBe('1');
    expect(songs[2].song_name).toBe('China Cat Sunflower');
    expect(songs[2].segue).toBe(true);
    expect(songs[3].song_name).toBe('Sand');
    expect(songs[3].segue).toBe(true);
  });

  it('parses Set I/II/E structure (Enigma Bazaar)', () => {
    const text = `Set I
Wilder
Coyotes

Set II
DasFut
Mad Ones Rave

E:
Clint Eastwood[6]`;
    const songs = parseSetlistText(text);
    expect(songs).toHaveLength(5);
    expect(songs[0].set_name).toBe('Set I');
    expect(songs[0].song_name).toBe('Wilder');
    expect(songs[2].set_name).toBe('Set II');
    expect(songs[4].set_name).toBe('Encore');
    expect(songs[4].song_name).toBe('Clint Eastwood');
    expect(songs[4].footnote_refs).toBe('6');
  });

  it('parses timing and transitions (Lot 46)', () => {
    const text = `Set I 
Empire of love - 9:15
Back on the train[1] - 6:10 >
DasFut - 8:53`;
    const songs = parseSetlistText(text);
    expect(songs).toHaveLength(3);
    expect(songs[0].minutes).toBe(9);
    expect(songs[0].seconds).toBe(15);
    expect(songs[1].segue).toBe(true);
    expect(songs[1].song_name).toBe('Back on the train');
  });

  it('parses inline arrows (Goosetown Station)', () => {
    const text = `Pans Perfume
Hollow Bamboo ->
Wilder ->
Sandworm ->`;
    const songs = parseSetlistText(text);
    expect(songs).toHaveLength(4);
    expect(songs[0].song_name).toBe('Pans Perfume');
    expect(songs[0].segue).toBe(false);
    expect(songs[1].song_name).toBe('Hollow Bamboo');
    expect(songs[1].segue).toBe(true);
    expect(songs[3].song_name).toBe('Sandworm');
    expect(songs[3].segue).toBe(true);
  });
});
