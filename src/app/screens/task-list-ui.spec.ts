import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { weekOf } from '../data/day.model';
import { EMPTY_TASK } from '../mocks/mock-data';
import { TaskListUi } from './task-list-ui';

// Fixed week so the tests don't depend on today's date. Monday 2 Nov and Monday 9 Nov 2026.
const MONDAY = weekOf(new Date(2026, 10, 2))[0];
const NEXT_MONDAY = weekOf(new Date(2026, 10, 9))[0];

describe('TaskListUi', () => {
  // Each test starts with an empty storage and two Monday tasks
  function create(day = MONDAY) {
    const shownDay = signal(day);
    const list = TestBed.runInInjectionContext(() => new TaskListUi(shownDay));
    list.save({ ...EMPTY_TASK, name: 'Walk', days: ['MONDAY'] });
    list.save({ ...EMPTY_TASK, name: 'Read', days: ['MONDAY'] });
    return { list, shownDay };
  }

  // Node's own localStorage hides jsdom's, so we use a simple in-memory one
  beforeEach(() => {
    const entries = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('restores a deleted task in its original position', () => {
    const { list } = create();
    const before = list.tasks().map((t) => t.id);

    list.remove(before[0]);
    expect(list.tasks().map((t) => t.id)).toEqual(before.slice(1));
    expect(list.snackbar()).toContain('Walk');

    list.undoDelete();
    expect(list.tasks().map((t) => t.id)).toEqual(before);
    expect(list.snackbar()).toBeNull();
  });

  it('adds a new task when nothing is being edited', () => {
    const { list } = create();

    list.openCreate();
    list.save({ ...EMPTY_TASK, name: 'Stretch', days: ['MONDAY'] });

    expect(list.tasks()).toHaveLength(3);
    expect(list.sheetOpen()).toBe(false);
  });

  it('updates the task being edited', () => {
    const { list } = create();
    const task = list.tasks()[0];

    list.openEdit(task.id);
    list.save({ ...task, name: 'Breathe' });

    expect(list.tasks()[0].name).toBe('Breathe');
  });

  it('marks a task as done only on the date being shown', () => {
    const { list, shownDay } = create();
    const task = list.tasks()[0];

    list.toggle(task.id, true);
    expect(list.isDone(list.tasks()[0])).toBe(true);

    shownDay.set(NEXT_MONDAY);
    expect(list.isDone(list.tasks()[0])).toBe(false);

    shownDay.set(MONDAY);
    list.toggle(task.id, false);
    expect(list.isDone(list.tasks()[0])).toBe(false);
  });
});
