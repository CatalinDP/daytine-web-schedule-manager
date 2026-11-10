import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'dt-theme';

/** Holds the theme choice and mirrors it to `data-theme` on `<html>`. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly modeState = signal<ThemeMode>(this.readStoredMode());

  readonly mode = this.modeState.asReadonly();

  constructor() {
    this.applyToDocument(this.modeState());
  }

  setMode(mode: ThemeMode): void {
    this.modeState.set(mode);
    this.applyToDocument(mode);
    this.store(mode);
  }

  private applyToDocument(mode: ThemeMode): void {
    if (mode === 'system') {
      this.root.removeAttribute('data-theme');
    } else {
      this.root.setAttribute('data-theme', mode);
    }
  }

  private readStoredMode(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch (error) {
      console.warn('Stored theme could not be read', error);
      return 'system';
    }
  }

  private store(mode: ThemeMode): void {
    try {
      if (mode === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch (error) {
      console.warn('Theme choice could not be stored', error);
    }
  }
}
