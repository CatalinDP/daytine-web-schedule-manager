import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EMPTY_TASK } from '../mocks/mock-data';
import { ClockService } from './clock.service';
import { dayIdOf } from './day.model';
import { NotificationService } from './notifications.service';
import { Day } from './task.model';
import { TaskService } from './task.store';
import { TaskNotifierService } from './task.notifier.service';

// Tuesday 10 Nov 2026 at the given time
const at = (hour: number, minute: number) => new Date(2026, 10, 10, hour, minute);

describe('TaskNotifierService', () => {
  const now = signal(at(8, 0));
  const granted = signal(true);
  const show = vi.fn();

  // A fake clock and notifications, so tests control the time and see what was shown
  function configure() {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ClockService,
          useValue: {
            now,
            todayId: computed(() => dayIdOf(now())),
            nowMinutes: computed(() => now().getHours() * 60 + now().getMinutes()),
          },
        },
        { provide: NotificationService, useValue: { granted, show } },
      ],
    });
  }

  // Adds a "Walk" task at 9:00, starts the notifier and moves the clock to `time`
  function startAt(time: Date, days: Day[] = ['TUESDAY']) {
    const tasks = TestBed.inject(TaskService);
    tasks.add({ ...EMPTY_TASK, name: 'Walk', start: { hour: 9, minute: 0 }, days });
    TestBed.inject(TaskNotifierService);
    moveTo(time);
    return tasks;
  }

  function moveTo(time: Date) {
    now.set(time);
    TestBed.tick(); // runs pending effects
  }

  beforeEach(() => {
    // Node's own localStorage hides jsdom's, so we use a simple in-memory one
    const entries = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    });
    now.set(at(8, 0));
    granted.set(true);
    show.mockClear();
    configure();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('notifies when a task starts', () => {
    startAt(at(9, 0));

    expect(show).toHaveBeenCalledOnce();
    expect(show).toHaveBeenCalledWith('Walk', 'Starts at 09:00', expect.any(String));
  });

  it('still notifies within the tolerance, for example after the tab was asleep', () => {
    startAt(at(9, 5));

    expect(show).toHaveBeenCalledOnce();
  });

  it('does not notify before the start or after the tolerance', () => {
    startAt(at(8, 59));
    moveTo(at(9, 6));

    expect(show).not.toHaveBeenCalled();
  });

  it('notifies only once, even after a reload', () => {
    startAt(at(9, 0));
    moveTo(at(9, 1));
    expect(show).toHaveBeenCalledOnce();

    // A new notifier reads the sent marks back from storage
    TestBed.resetTestingModule();
    configure();
    TestBed.inject(TaskNotifierService);
    TestBed.tick();

    expect(show).toHaveBeenCalledOnce();
  });

  it('skips tasks already done today', () => {
    const tasks = startAt(at(8, 0));
    tasks.toggle(tasks.tasks()[0].id, '2026-11-10', true);
    moveTo(at(9, 0));

    expect(show).not.toHaveBeenCalled();
  });

  it('skips tasks of other days', () => {
    startAt(at(9, 0), ['MONDAY']);

    expect(show).not.toHaveBeenCalled();
  });

  it('does nothing without permission', () => {
    granted.set(false);
    startAt(at(9, 0));

    expect(show).not.toHaveBeenCalled();
  });
});
