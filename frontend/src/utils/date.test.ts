import { formatEventDate } from './date';

describe('formatEventDate', () => {
  it('formats ISO strings into readable dates', () => {
    expect(formatEventDate('2025-12-01T09:00:00.000Z')).toBe('Dec 1, 2025');
  });

  it('handles Date objects', () => {
    const date = new Date('2024-03-15T12:30:00.000Z');
    expect(formatEventDate(date)).toBe('Mar 15, 2024');
  });

  it('returns fallback for invalid dates', () => {
    expect(formatEventDate('not-a-date')).toBe('Invalid date');
  });
});

