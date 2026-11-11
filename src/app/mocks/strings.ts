import { CURRENT_LANGUAGE, Language } from '../data/language';
import { EN, Strings } from './strings.en';
import { ES } from './strings.es';

const BY_LANGUAGE: Record<Language, Strings> = { en: EN, es: ES };

export const STRINGS: Strings = BY_LANGUAGE[CURRENT_LANGUAGE];
