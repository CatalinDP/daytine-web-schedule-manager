import { describe, expect, it } from 'vitest';
import { formatTimeDuration, getTimeDuration, isOvernightTask } from './time';

describe('getTimeDuration', () => {
  it.each([
    {
      start: { hour: 13, minute: 30 },
      end: { hour: 16, minute: 30 },
      expected: 180,
      case: '3 hours in between',
    },
    {
      start: { hour: 23, minute: 30 },
      end: { hour: 3, minute: 30 },
      expected: 240,
      case: '4 hours in between',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 10, minute: 24 },
      expected: 54,
      case: '54 minutes',
    },
  ])('$case is to be $expected', ({ start, end, expected }) => {
    expect(getTimeDuration(start, end)).toBe(expected);
  });
});

describe('formatTimeDuration', () => {
  it.each([
    {
      start: { hour: 13, minute: 30 },
      end: { hour: 16, minute: 30 },
      expected: '3 h',
      case: '3 h in between',
    },
    {
      start: { hour: 23, minute: 30 },
      end: { hour: 3, minute: 0 },
      expected: '3 h 30 min',
      case: '3 h 30 min in between',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 10, minute: 24 },
      expected: '54 min',
      case: '54 min in between',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 9, minute: 30 },
      expected: '',
      case: 'no time in between',
    },
  ])('$case is to be $expected', ({ start, end, expected }) => {
    expect(formatTimeDuration(start, end, 'h', 'min')).toBe(expected);
  });
});

describe('isOvernightTask', () => {
  it.each([
    {
      start: { hour: 23, minute: 30 },
      end: { hour: 6, minute: 30 },
      expected: true,
      case: 'ends after midnight',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 10, minute: 0 },
      expected: false,
      case: 'ends the same day',
    },
    {
      start: { hour: 23, minute: 30 },
      end: { hour: 0, minute: 0 },
      expected: false,
      case: 'ends exactly at midnight',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 9, minute: 30 },
      expected: false,
      case: 'starts and ends at the same time',
    },
  ])('$case → $expected', ({ start, end, expected }) => {
    expect(isOvernightTask(start, end)).toBe(expected);
  });
});
