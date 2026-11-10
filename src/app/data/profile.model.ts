import { TimeValue } from '../design/time';
import { isTimeValue } from './task.model';

export interface User {
  id: string;
  name: string;
  start: TimeValue;
}

export function isUser(v: unknown): v is User {
  if (typeof v !== 'object' || v === null) return false;
  const u = v as Record<string, unknown>;
  return typeof u['id'] === 'string' && typeof u['name'] === 'string' && isTimeValue(u['start']);
}
