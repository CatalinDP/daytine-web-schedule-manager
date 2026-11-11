import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CURRENT_LANGUAGE, Language, LanguageService, pickLanguage } from './language';

describe('pickLanguage', () => {
  it('uses the saved choice first', () => {
    expect(pickLanguage('es', 'en-US')).toBe('es');
    expect(pickLanguage('en', 'es-ES')).toBe('en');
  });

  it('falls back to the browser language', () => {
    expect(pickLanguage(null, 'es-MX')).toBe('es');
    expect(pickLanguage(null, 'ES')).toBe('es');
    expect(pickLanguage(null, 'fr-FR')).toBe('en');
  });

  it('ignores unknown saved values and a missing browser language', () => {
    expect(pickLanguage('de', undefined)).toBe('en');
  });
});

describe('LanguageService', () => {
  const entries = new Map<string, string>();
  const reload = vi.fn();
  const html = { lang: '' };

  beforeEach(() => {
    entries.clear();
    reload.mockClear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    });
    // A fake document, because jsdom can't really reload the page
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { documentElement: html, location: { reload } } }],
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('sets the lang attribute of the page', () => {
    TestBed.inject(LanguageService);

    expect(html.lang).toBe(CURRENT_LANGUAGE);
  });

  it('saves a new language and reloads', () => {
    const other: Language = CURRENT_LANGUAGE === 'en' ? 'es' : 'en';

    TestBed.inject(LanguageService).set(other);

    expect(entries.get('dt-lang')).toBe(other);
    expect(reload).toHaveBeenCalledOnce();
  });

  it('does nothing when the language is already active', () => {
    TestBed.inject(LanguageService).set(CURRENT_LANGUAGE);

    expect(reload).not.toHaveBeenCalled();
  });
});
