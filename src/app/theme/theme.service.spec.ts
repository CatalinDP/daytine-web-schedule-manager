import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const root = document.documentElement;

  beforeEach(() => {
    const entries = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    });
    root.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('follows the system by default, leaving data-theme unset', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.mode()).toBe('system');
    expect(root.hasAttribute('data-theme')).toBe(false);
  });

  it('applies and stores an explicit theme', () => {
    const service = TestBed.inject(ThemeService);

    service.setMode('dark');

    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('dt-theme')).toBe('dark');
  });

  it('clears the attribute and storage when going back to system', () => {
    const service = TestBed.inject(ThemeService);
    service.setMode('light');

    service.setMode('system');

    expect(root.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem('dt-theme')).toBeNull();
  });

  it('restores a stored theme', () => {
    localStorage.setItem('dt-theme', 'light');

    const service = TestBed.inject(ThemeService);

    expect(service.mode()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem('dt-theme', 'sepia');

    expect(TestBed.inject(ThemeService).mode()).toBe('system');
  });
});
