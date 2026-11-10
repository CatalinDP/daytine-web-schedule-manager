import { TimeValue } from '../design/time';
import { dateKey } from './day.model';
import { Day, isTaskList, Task } from './task.model';

/**
 * Backup file format, shared by the web and the Android app.
 *
 * Field names and values are chosen to map 1:1 to Kotlin types:
 * - days        -> java.time.DayOfWeek names ("MONDAY")
 * - start / end -> LocalTime (hour, minute)
 * - completedOn -> LocalDate ISO strings ("2026-11-09")
 *
 * Increase BACKUP_VERSION whenever the format changes in a way old readers can't handle.
 */
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
  exportedAt: string; // ISO date-time, e.g. "2026-11-09T18:30:00.000Z"
  tasks: BackupTask[];
}

export type ParseResult =
  | { ok: true; backup: BackupFile }
  | {
      ok: false;
      error: 'invalid-json' | 'not-a-backup' | 'newer-version' | 'invalid-data' | 'read-error';
    };

/**
 * Builds the object that will be written to the file.
 * Copy only the known fields, so nothing extra (or private) ends up in the backup.
 */
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

/**
 * Reads the text of a file chosen by the user. The file is untrusted:
 * never assume a field exists or has the right type.
 */
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

/** "daytine-backup-2026-11-09.json" */
export function backupFileName(now: Date): string {
  // The version is inside the file, and ':' is not allowed in Windows file names
  return `daytine-backup-${dateKey(now)}.json`;
}
