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

export const toMinutes = (t: TimeValue): number => t.hour * 60 + t.minute;
