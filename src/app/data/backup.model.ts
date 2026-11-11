import { TimeValue } from '../design/time';
import { dateKey } from './day.model';
import { Day, isTaskList, Task } from './task.model';

// Shared with the Android app: fields map to DayOfWeek, LocalTime and LocalDate.
// Bump BACKUP_VERSION when old readers can't handle a format change.
export const BACKUP_VERSION = 1;
export const BACKUP_APP_ID = 'daytine';

export interface BackupTask {
  id: string;
  name: string;
  start: TimeValue;
  end: TimeValue;
  days: Day[];
  completedOn: string[];
}

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  version: number;
  exportedAt: string;
  tasks: BackupTask[];
}

export type ParseResult =
  | { ok: true; backup: BackupFile }
  | {
      ok: false;
      error: 'invalid-json' | 'not-a-backup' | 'newer-version' | 'invalid-data' | 'read-error';
    };

export function toBackup(tasks: Task[], now: Date): BackupFile {
  const backUpTasks = tasks.map((t) => {
    return toBackupTask(t);
  });
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    tasks: backUpTasks,
  };
}

export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid-json' };
  }
  if (typeof data !== 'object' || data === null) {
    return { ok: false, error: 'not-a-backup' };
  }
  const file = data as Record<string, unknown>;
  if (file['app'] !== BACKUP_APP_ID) {
    return { ok: false, error: 'not-a-backup' };
  }
  if (typeof file['version'] !== 'number' || file['version'] > BACKUP_VERSION) {
    return { ok: false, error: 'newer-version' };
  }
  if (!isTaskList(file['tasks']) || typeof file['exportedAt'] !== 'string') {
    return { ok: false, error: 'invalid-data' };
  }
  const backup: BackupFile = {
    app: BACKUP_APP_ID,
    version: file['version'],
    exportedAt: file['exportedAt'],
    tasks: file['tasks'].map((t) => toBackupTask(t)),
  };
  return { ok: true, backup: backup };
}

function toBackupTask(t: Task): BackupTask {
  return {
    id: t.id,
    name: t.name,
    start: t.start,
    end: t.end,
    days: t.days,
    completedOn: t.completedOn,
  };
}

export function backupFileName(now: Date): string {
  // The version is inside the file, and ':' is not allowed in Windows file names
  return `daytine-backup-${dateKey(now)}.json`;
}
