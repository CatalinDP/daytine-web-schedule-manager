import { describe, expect, it } from 'vitest';

import { backupFileName } from './backup.model';

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
