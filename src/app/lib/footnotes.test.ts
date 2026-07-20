import { describe, it, expect } from 'vitest';
import { parseShowFootnotes, resolveFootnoteText } from './footnotes';

describe('parseShowFootnotes', () => {
  it('parses numbered note lines', () => {
    const notes = '1. Beatles\n2. Grateful Dead\n3. Phish';
    expect(parseShowFootnotes(notes)).toEqual({
      '1': 'Beatles',
      '2': 'Grateful Dead',
      '3': 'Phish',
    });
  });

  it('returns empty object for empty notes', () => {
    expect(parseShowFootnotes(null)).toEqual({});
    expect(parseShowFootnotes('')).toEqual({});
  });
});

describe('resolveFootnoteText', () => {
  const notes = '1. Beatles\n2. Grateful Dead\n3. Phish';

  it('resolves a single footnote ref', () => {
    expect(resolveFootnoteText('1', notes)).toBe('Beatles');
  });

  it('resolves multiple footnote refs', () => {
    expect(resolveFootnoteText('1,3', notes)).toBe('Beatles; Phish');
  });

  it('returns null when refs or notes are missing', () => {
    expect(resolveFootnoteText(null, notes)).toBeNull();
    expect(resolveFootnoteText('1', null)).toBeNull();
  });
});
