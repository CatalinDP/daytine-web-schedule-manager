import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requireProfile } from './profile.guard';
import { ProfileService } from './profile.store';

describe('ProfileService', () => {
  let entries: Map<string, string>;

  // Node's own localStorage hides jsdom's, so we use a simple in-memory one
  beforeEach(() => {
    entries = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    });
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('persists the profile and its updates across reloads', () => {
    const first = TestBed.inject(ProfileService);
    first.saveUser('Ana', { hour: 8, minute: 30 });
    first.updateName('Ana María');
    first.updateStart({ hour: 7, minute: 0 });

    // A fresh injector simulates reloading the page
    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(ProfileService);

    expect(reloaded.user()).toMatchObject({ name: 'Ana María', start: { hour: 7, minute: 0 } });
    expect(reloaded.user()?.id).toBe(first.user()?.id);
  });

  it('redirects to onboarding when there is no profile', () => {
    const result = TestBed.runInInjectionContext(() => requireProfile({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/welcome');
  });

  it('lets the user in once the profile exists', () => {
    TestBed.inject(ProfileService).saveUser('Ana', { hour: 9, minute: 0 });

    expect(TestBed.runInInjectionContext(() => requireProfile({} as never, {} as never))).toBe(
      true,
    );
  });
});
