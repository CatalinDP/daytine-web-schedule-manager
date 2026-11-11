import { CURRENT_LOCALE } from './language';
import { Day, DAY_BY_ID, DayInfo } from './task.model';

const JS_DAY_TO_ID = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const satisfies readonly Day[];

export function dayIdOf(date: Date): Day {
  return JS_DAY_TO_ID[date.getDay()];
}

export function dateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export type WeekDay = DayInfo & {
  readonly date: number;
  readonly key: string;
  readonly isToday: boolean;
};

export function startOfWeek(date: Date, weekStartsOn: Day = 'MONDAY'): Date {
  const firstDay = JS_DAY_TO_ID.indexOf(weekStartsOn);
  const diff = (date.getDay() - firstDay + 7) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
}

export function weekOf(
  reference: Date,
  weekStartsOn: Day = 'MONDAY',
  now: Date = new Date(),
): readonly WeekDay[] {
  const weekStart = startOfWeek(reference, weekStartsOn);
  const today = dateKey(now);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const info = DAY_BY_ID[dayIdOf(d)];
    return {
      ...info,
      date: d.getDate(),
      key: dateKey(d),
      isToday: dateKey(d) === today,
    };
  });
}
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function formatLongDate(date: Date, locale = CURRENT_LOCALE): string {
  return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatWeekRange(week: readonly WeekDay[], locale = CURRENT_LOCALE): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const first = new Date(week[0].key + 'T00:00');
  const last = new Date(week[week.length - 1].key + 'T00:00');
  return `${first.toLocaleDateString(locale, options)} - ${last.toLocaleDateString(locale, options)}`;
}
