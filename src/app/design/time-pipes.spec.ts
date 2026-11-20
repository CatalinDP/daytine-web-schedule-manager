import { describe, expect, it } from 'vitest';

import { TimeDurationPipe, TimeRangePipe } from './time-pipes';

// h for hour and min for minutes is used as universal unit for the application. If changed, remember to change them on the tests
describe('TimeDurationPipe', () => {
  it.each([
    {
      start: { hour: 13, minute: 30 },
      end: { hour: 16, minute: 30 },
      expected: '3 h',
      case: 'whole hours',
    },
    {
      start: { hour: 23, minute: 30 },
      end: { hour: 3, minute: 0 },
      expected: '3 h 30 min',
      case: 'hours and minutes across midnight',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 10, minute: 24 },
      expected: '54 min',
      case: 'minutes only',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 9, minute: 30 },
      expected: '',
      case: 'an empty span as empty',
    },
  ])('formats $case', ({ start, end, expected }) => {
    const pipe = new TimeDurationPipe();
    expect(pipe.transform(start, end)).toBe(expected);
  });
});

describe('TimeRangePipe', () => {
  it.each([
    {
      start: { hour: 13, minute: 30 },
      end: { hour: 16, minute: 30 },
      expected: '13:30 - 16:30',
    },
    {
      start: { hour: 23, minute: 30 },
      end: { hour: 3, minute: 0 },
      expected: '23:30 - 03:00',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 10, minute: 24 },
      expected: '09:30 - 10:24',
    },
    {
      start: { hour: 9, minute: 30 },
      end: { hour: 9, minute: 40 },
      expected: '09:30 - 09:40',
    },
  ])('formats $expected', ({ start, end, expected }) => {
    const pipe = new TimeRangePipe();
    expect(pipe.transform(start, end)).toBe(expected);
  });
});
