import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStore {
  read<T>(key: string, isValid: (value: unknown) => value is T): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      const parsed = JSON.parse(raw);
      return isValid(parsed) ? parsed : null;
    } catch (e) {
      console.error('Error reading local storage', e);
      return null;
    }
  }

  write(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing local storage', e);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
