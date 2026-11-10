import { inject, Injectable } from '@angular/core';
import { TaskService } from './task.store';
import { backupFileName, parseBackup, ParseResult, toBackup } from './backup.model';

// Files bigger than this are rejected before reading them (years of data are well under 1 MB)
export const MAX_BACKUP_BYTES = 1024 * 1024;

export type ImportResult = ParseResult | { ok: false; error: 'too-big' | 'read-error' };
export type ImportError = Exclude<ImportResult, { ok: true }>['error'];

@Injectable({ providedIn: 'root' })
export class BackupService {
  private tasks = inject(TaskService);

  /** Downloads the current tasks as a .json file. */
  exportToFile(): void {
    const now = new Date();
    const backup = toBackup(this.tasks.tasks(), now);
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFileName(now);
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Reads a file chosen by the user and, if it is valid, replaces the current data.
   * Returns the result so the screen can show a message.
   */
  async importFromFile(file: File): Promise<ImportResult> {
    if (file.size > MAX_BACKUP_BYTES) {
      return { ok: false, error: 'too-big' };
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      return { ok: false, error: 'read-error' };
    }
    const result = parseBackup(text);
    if (result.ok) {
      this.tasks.replaceAll(result.backup.tasks);
    }
    return result;
  }
}
