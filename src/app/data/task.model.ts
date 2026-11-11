import { TimeValue } from '../design/time';
import { STRINGS } from '../mocks/strings';

export interface Task {
  id: string;
  name: string;
  start: TimeValue;
  end: TimeValue;
  days: Day[];
  completedOn: string[];
}

export function isDoneOn(task: Task, dateKey: string): boolean {
  return task.completedOn.includes(dateKey);
}

const DAY_IDS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export type Day = (typeof DAY_IDS)[number];

export interface DayInfo {
  readonly id: Day;
  readonly label: string;
  readonly short: string;
  readonly narrow: string;
}

export const DAYS: readonly DayInfo[] = DAY_IDS.map((id) => ({ id, ...STRINGS.days[id] }));

export const DAY_BY_ID = Object.fromEntries(DAYS.map((d) => [d.id, d])) as Record<Day, DayInfo>;

export function isTimeValue(v: unknown): v is TimeValue {
  if (typeof v !== 'object' || v === null) return false;
  const { hour, minute } = v as Record<string, unknown>;
  return (
    typeof hour === 'number' &&
    hour >= 0 &&
    hour <= 23 &&
    typeof minute === 'number' &&
    minute >= 0 &&
    minute <= 59
  );
}

export function isDay(v: unknown): v is Day {
  return DAYS.some((d) => d.id === v);
}

export function isTask(v: unknown): v is Task {
  if (typeof v !== 'object' || v === null) return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t['id'] === 'string' &&
    typeof t['name'] === 'string' &&
    Array.isArray(t['completedOn']) &&
    t['completedOn'].every((d) => typeof d === 'string') &&
    isTimeValue(t['start']) &&
    isTimeValue(t['end']) &&
    Array.isArray(t['days']) &&
    t['days'].every(isDay)
  );
}

export function isTaskList(v: unknown): v is Task[] {
  return Array.isArray(v) && v.every(isTask);
}
