import { describe, it, expect } from 'vitest';
import { DEFAULT_TAG, isTagId } from './tag.model';
import { isTask, Task, withTaskDefaults } from './task.model';

const VALID_TASK: Task = {
  id: 'task-1',
  name: 'Night shift',
  start: { hour: 23, minute: 0 },
  end: { hour: 6, minute: 0 },
  days: ['MONDAY', 'FRIDAY'],
  completedOn: ['2026-11-23'],
  color: 'teal',
};

function taskWithout(...keys: (keyof Task)[]): Partial<Task> {
  const copy: Partial<Task> = { ...VALID_TASK };
  for (const key of keys) delete copy[key];
  return copy;
}

describe('isTagId', () => {
  it.each([
    { id: 'blue', expected: true },
    { id: 'slate', expected: true },
    { id: 'Blue', expected: false },
    { id: 'nope', expected: false },
    { id: null, expected: false },
  ])('$id to be $expected', ({ id, expected }) => {
    expect(isTagId(id)).toBe(expected);
  });
});

describe('isTask', () => {
  it.each([
    { task: VALID_TASK, expected: true, taskName: 'accepts a complete task' },
    {
      task: { ...VALID_TASK, color: 'kryptonite' },
      expected: false,
      taskName: 'rejects an unknown color',
    },
    { task: taskWithout('color'), expected: false, taskName: 'rejects a task without color' },
    { task: taskWithout('name'), expected: false, taskName: 'rejects a task without name' },
  ])('$taskName', ({ task, expected }) => {
    expect(isTask(task)).toBe(expected);
  });
});

describe('withTaskDefaults', () => {
  const withoutColorTask = taskWithout('color');
  const withoutCompletedOnTask = taskWithout('completedOn');
  const taskWithoutColorAndCompletedOn = taskWithout('color', 'completedOn');
  it.each([
    {
      task: VALID_TASK,
      case: 'keeps a complete task unchanged',
      expected: VALID_TASK,
      isTaskResult: true,
    },
    {
      task: withoutColorTask,
      case: 'adds the default color when it is missing',
      expected: { ...withoutColorTask, color: DEFAULT_TAG },
      isTaskResult: true,
    },
    {
      task: withoutCompletedOnTask,
      case: 'adds an empty completedOn when it is missing',
      expected: { ...withoutCompletedOnTask, completedOn: [] },
      isTaskResult: true,
    },
    {
      task: taskWithoutColorAndCompletedOn,
      case: 'adds both fields to a task from the oldest version',
      expected: { ...taskWithoutColorAndCompletedOn, completedOn: [], color: DEFAULT_TAG },
      isTaskResult: true,
    },
    {
      task: { ...VALID_TASK, color: 'nope' },
      case: 'does not fix an invalid color',
      expected: { ...VALID_TASK, color: 'nope' },
      isTaskResult: false,
    },
  ])('$case', ({ task, expected, isTaskResult }) => {
    const t = withTaskDefaults(task);
    expect(t).toEqual(expected);
    expect(isTask(t)).toBe(isTaskResult);
  });

  it.each([null, 42, 'text', []])('returns %j untouched', (value) => {
    expect(withTaskDefaults(value)).toBe(value);
  });

  it('gives each task its own completedOn array', () => {
    const a = withTaskDefaults(taskWithout('completedOn')) as Task;
    const b = withTaskDefaults(taskWithout('completedOn')) as Task;
    expect(a.completedOn).not.toBe(b.completedOn);
  });
});
