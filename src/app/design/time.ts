const MINUTES_PER_DAY = 1440;

export interface TimeValue {
  readonly hour: number;
  readonly minute: number;
}

export function padTime(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatTime({ hour, minute }: TimeValue): string {
  return `${padTime(hour)}:${padTime(minute)}`;
}

export function formatTimeRange(start: TimeValue, end: TimeValue): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function getTimeDuration(start: TimeValue, end: TimeValue): number {
  let totalMinutes = toMinutes(end) - toMinutes(start);
  if (totalMinutes < 0) {
    // If the minutes are negative, midnight was surpassed. We add a full day to get the real duration of the task
    totalMinutes += MINUTES_PER_DAY;
  }
  return totalMinutes;
}

export function formatTimeDuration(
  start: TimeValue,
  end: TimeValue,
  hourUnit: string,
  minuteUnit: string,
): string {
  const time = getTimeDuration(start, end);
  if (time === 0) return '';
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  return hours > 0
    ? `${hours} ${hourUnit}${minutes > 0 ? ` ${minutes} ${minuteUnit}` : ''}`
    : `${minutes} ${minuteUnit}`;
}

export const toMinutes = (t: TimeValue): number => t.hour * 60 + t.minute;
