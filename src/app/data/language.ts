import { DOCUMENT, inject, Injectable } from '@angular/core';

export type Language = 'en' | 'es';

export const LANGUAGES: readonly Language[] = ['en', 'es'];

export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', es: 'Español' };

const LOCALES: Record<Language, string> = { en: 'en-US', es: 'es-ES' };

const STORAGE_KEY = 'dt-lang';

export function pickLanguage(stored: string | null, browserLanguage: string | undefined): Language {
  if (stored === 'en' || stored === 'es') return stored;
  return browserLanguage?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function readStoredLanguage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Stored language could not be read', error);
    return null;
  }
}

// Read once at startup, so changing the language reloads the page
export const CURRENT_LANGUAGE: Language = pickLanguage(
  readStoredLanguage(),
  globalThis.navigator?.language,
);

export const CURRENT_LOCALE = LOCALES[CURRENT_LANGUAGE];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);

  readonly current = CURRENT_LANGUAGE;

  constructor() {
    this.document.documentElement.lang = this.current;
  }

  set(language: Language): void {
    if (language === this.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.error('Language choice could not be stored', error);
      return;
    }
    this.document.location.reload();
  }
}
