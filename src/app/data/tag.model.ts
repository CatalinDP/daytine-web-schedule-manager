import { InjectionToken } from '@angular/core';

export const DEFAULT_TAG: TagId = 'blue';

export const TAG_IDS = [
  'blue',
  'green',
  'amber',
  'red',
  'purple',
  'pink',
  'teal',
  'slate',
] as const;
export type TagId = (typeof TAG_IDS)[number];

export const TAG_PALETTE = new InjectionToken<readonly TagId[]>('TAG_PALETTE', {
  providedIn: 'root',
  factory: () => TAG_IDS,
});

export function isTagId(v: unknown): v is TagId {
  return TAG_IDS.some((c) => c === v);
}
