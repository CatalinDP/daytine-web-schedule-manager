import { describe, expect, it } from 'vitest';

import { BACKUP_APP_ID, backupFileName, parseBackup, toBackup } from './backup.model';
import { Task } from './task.model';
import { DEFAULT_TAG } from './tag.model';

// Write these tests while implementing backup.model.ts (step 1 and 2 of docs/export-import-plan.md).
// Replace `it.todo` with `it` and add the body.

describe('toBackup', () => {
  it.todo('sets app, version and exportedAt');
  it.todo('copies tasks with only the known fields');
});

describe('backupFileName', () => {
  it('uses the local date, e.g. daytine-backup-2026-11-09.json', () => {
    // 23:30 local time: toISOString() would already say the next day in some time zones
    expect(backupFileName(new Date(2026, 10, 9, 23, 30))).toBe('daytine-backup-2026-11-09.json');
  });
});

describe('parseBackup', () => {
  it.todo('reads a file created by toBackup (round trip)');
  it.todo('returns invalid-json for text that is not JSON');
  it.todo('returns not-a-backup when "app" is missing or different');
  it.todo('returns newer-version when version is bigger than BACKUP_VERSION');
  it.todo('returns invalid-data when a task has a wrong field');
  it.todo('drops unknown fields instead of keeping them');
});

// DT-104: the generic backup cases above belong to DT-106.
describe('task colors in backups', () => {
  const EXPORTED_AT = new Date(2026, 0, 1, 9, 30);

  const COLORED_TASK: Task = {
    id: 'task-1',
    name: 'Night shift',
    start: { hour: 23, minute: 0 },
    end: { hour: 6, minute: 0 },
    days: ['MONDAY', 'FRIDAY'],
    completedOn: ['2025-12-29'],
    color: 'teal',
  };

  // Written by hand on purpose: a file exported before DT-104 (or by an older Android app)
  // has no `color` field. Building it with toBackup would add one.
  const LEGACY_BACKUP_JSON = JSON.stringify({
    app: BACKUP_APP_ID,
    version: 1,
    exportedAt: '2025-12-31T10:00:00.000Z',
    tasks: [
      {
        id: 'legacy-1',
        name: 'Gym',
        start: { hour: 18, minute: 0 },
        end: { hour: 19, minute: 30 },
        days: ['TUESDAY', 'THURSDAY'],
        completedOn: ['2025-12-30'],
      },
    ],
  });

  it('imports a backup made before task colors with the default color', () => {
    const result = parseBackup(LEGACY_BACKUP_JSON);
    if (!result.ok) throw new Error(`Expected ok, got ${result.error}`);
    expect(result.backup.tasks[0].color).toBe(DEFAULT_TAG);
  });
  it('keeps the color through export and import', () => {
    const backup = JSON.stringify(toBackup([COLORED_TASK], EXPORTED_AT));
    const result = parseBackup(backup);
    if (!result.ok) throw new Error(`Expected ok, got ${result.error}`);
    expect(result.backup.tasks[0].color).toBe('teal');
  });
});
