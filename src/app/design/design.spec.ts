import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { OptionDialog, TextFieldDialog, TimeInputDialog } from './app-dialog';
import { DayPicker } from './day-picker';
import { OptionSetting, SwitchRow } from './settings-rows';
import { Snackbar } from './snackbar';
import { TaskItem } from './task-item';
import { TimeValue } from './time';
import { TimeInput } from './time-input';
import { WeekBoard } from './week-board';
import { WeeklyStatView, barHeightPercent } from './weekly-stat-view';

const TIME_LABELS = { hour: 'Hour', minute: 'Minute' };

async function render<T>(
  component: Type<T>,
  inputs: Record<string, unknown>,
): Promise<{ fixture: ComponentFixture<T>; host: HTMLElement }> {
  const fixture = TestBed.createComponent(component);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  await fixture.whenStable();
  return { fixture, host: fixture.nativeElement };
}

function query<T extends HTMLElement>(host: HTMLElement, selector: string): T {
  const element = host.querySelector<T>(selector);
  if (!element) throw new Error(`Nothing matches ${selector}`);
  return element;
}

function buttonNamed(host: HTMLElement, name: string): HTMLButtonElement {
  const button = [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === name);
  if (!button) throw new Error(`No button named ${name}`);
  return button;
}

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

describe('barHeightPercent', () => {
  it.each([
    [null, 12],
    [0, 12],
    [0.05, 12],
    [0.5, 50],
    [1, 100],
    [1.4, 100],
  ])('maps %s to %s%%', (ratio, expected) => {
    expect(barHeightPercent(ratio)).toBeCloseTo(expected);
  });
});

describe('WeeklyStatView', () => {
  it('labels each column for assistive tech', async () => {
    const { host } = await render(WeeklyStatView, {
      days: [
        { key: 'mon', label: 'M', accessibleLabel: 'Monday: 50% done', ratio: 0.5, isToday: false },
      ],
    });

    expect(query(host, 'li').getAttribute('aria-label')).toBe('Monday: 50% done');
  });
});

describe('TaskItem', () => {
  const inputs = { name: 'Read', timeRange: '22:00 - 22:30', deleteLabel: 'Delete Read' };

  it('keeps interactive elements as siblings, never nested', async () => {
    const { host } = await render(TaskItem, inputs);

    expect(host.querySelector('button button, button input, a button')).toBeNull();
  });

  it('only toggles when the checkbox is clicked', async () => {
    const { fixture, host } = await render(TaskItem, inputs);
    const toggled = vi.fn();
    const edited = vi.fn();
    fixture.componentInstance.checkedChange.subscribe(toggled);
    fixture.componentInstance.edit.subscribe(edited);

    query(host, 'input').click();

    expect(toggled).toHaveBeenCalledWith(true);
    expect(edited).not.toHaveBeenCalled();
  });

  it('opens edit from the name and reports delete from the button', async () => {
    const { fixture, host } = await render(TaskItem, inputs);
    const edited = vi.fn();
    const deleted = vi.fn();
    fixture.componentInstance.edit.subscribe(edited);
    fixture.componentInstance.delete.subscribe(deleted);

    query(host, 'button:not([aria-label])').click();
    query(host, 'button[aria-label="Delete Read"]').click();

    expect(edited).toHaveBeenCalledOnce();
    expect(deleted).toHaveBeenCalledOnce();
  });

  it('disables the checkbox on other days', async () => {
    const { host } = await render(TaskItem, { ...inputs, isToday: false });

    expect(query<HTMLInputElement>(host, 'input').disabled).toBe(true);
  });
});

describe('SwitchRow', () => {
  it('exposes its state and toggles from the whole row', async () => {
    const { fixture, host } = await render(SwitchRow, { label: 'Weather', checked: true });
    const changed = vi.fn();
    fixture.componentInstance.checkedChange.subscribe(changed);
    const row = query(host, '[role=switch]');

    row.click();

    expect(row.getAttribute('aria-checked')).toBe('true');
    expect(changed).toHaveBeenCalledWith(false);
  });
});

describe('OptionSetting', () => {
  const inputs = {
    label: 'Theme',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
    selected: 'dark',
  };

  it('shows the selected option on the row and in the inline control', async () => {
    const { host } = await render(OptionSetting<string>, inputs);
    const radios = host.querySelectorAll<HTMLInputElement>('input[type=radio]');

    expect(query(host, 'dt-single-line-setting-button').textContent).toContain('Dark');
    expect(radios[1].checked).toBe(true);
  });

  it('reports inline selections and row presses separately', async () => {
    const { fixture, host } = await render(OptionSetting<string>, inputs);
    const selected = vi.fn();
    const pressed = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(selected);
    fixture.componentInstance.pressed.subscribe(pressed);

    host.querySelectorAll<HTMLInputElement>('input[type=radio]')[0].click();
    query(host, 'dt-single-line-setting-button button').click();

    expect(selected).toHaveBeenCalledWith('light');
    expect(pressed).toHaveBeenCalledOnce();
  });
});

describe('WeekBoard', () => {
  const task = { id: 'read', name: 'Read', time: '22:00', done: false };
  const day = { key: 'mon', label: 'Monday', shortLabel: 'Mon', date: 2, tasks: [task] };
  const inputs = {
    days: [
      { ...day, isToday: false },
      { ...day, key: 'tue', label: 'Tuesday', isToday: true },
    ],
    addText: 'Add',
    addLabel: (name: string) => `Add task on ${name}`,
    deleteLabel: (name: string) => `Delete ${name}`,
  };

  it('only enables checkboxes on today', async () => {
    const { host } = await render(WeekBoard, inputs);
    const [other, today] = host.querySelectorAll<HTMLInputElement>('input');

    expect(other.disabled).toBe(true);
    expect(today.disabled).toBe(false);
  });

  it('keeps interactive elements as siblings, never nested', async () => {
    const { host } = await render(WeekBoard, inputs);

    expect(host.querySelector('button button, button input')).toBeNull();
  });

  it('reports actions with the day they belong to', async () => {
    const { fixture, host } = await render(WeekBoard, inputs);
    const toggled = vi.fn();
    const added = vi.fn();
    const deleted = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);
    fixture.componentInstance.add.subscribe(added);
    fixture.componentInstance.delete.subscribe(deleted);

    host.querySelectorAll<HTMLInputElement>('input')[1].click();
    query(host, '[aria-label="Add task on Tuesday"]').click();
    query(host, '[aria-label="Delete Read"]').click();

    expect(toggled).toHaveBeenCalledWith({ dayIndex: 1, taskId: 'read', done: true });
    expect(added).toHaveBeenCalledWith(1);
    expect(deleted).toHaveBeenCalledWith({ dayIndex: 0, taskId: 'read' });
  });
});

describe('TimeInput', () => {
  async function renderTime(value: TimeValue) {
    const result = await render(TimeInput, { label: 'Start', labels: TIME_LABELS, value });
    const emitted = vi.fn();
    result.fixture.componentInstance.valueChange.subscribe(emitted);
    return {
      emitted,
      hour: query<HTMLInputElement>(result.host, '[aria-label=Hour]'),
      minute: query<HTMLInputElement>(result.host, '[aria-label=Minute]'),
    };
  }

  it('shows the time with two digits', async () => {
    const { hour, minute } = await renderTime({ hour: 7, minute: 5 });

    expect(hour.value).toBe('07');
    expect(minute.value).toBe('05');
  });

  it('emits the new hour and minute', async () => {
    const { hour, minute, emitted } = await renderTime({ hour: 7, minute: 0 });

    type(hour, '9');
    expect(emitted).toHaveBeenLastCalledWith({ hour: 9, minute: 0 });

    type(minute, '30');
    expect(emitted).toHaveBeenLastCalledWith({ hour: 7, minute: 30 });
  });

  it('ignores out-of-range values', async () => {
    const { hour, minute, emitted } = await renderTime({ hour: 7, minute: 0 });

    type(hour, '24');
    type(minute, '60');

    expect(emitted).not.toHaveBeenCalled();
  });

  // Like a real parent: every emitted value is passed back in, which re-renders the boxes
  it('keeps what the user types until the box loses focus', async () => {
    const { fixture, host } = await render(TimeInput, {
      label: 'Start',
      labels: TIME_LABELS,
      value: { hour: 7, minute: 0 },
    });
    fixture.componentInstance.valueChange.subscribe((v) =>
      fixture.componentRef.setInput('value', v),
    );
    const hour = query<HTMLInputElement>(host, '[aria-label=Hour]');

    hour.dispatchEvent(new FocusEvent('focus'));
    type(hour, '1');
    await fixture.whenStable();
    expect(hour.value).toBe('1');

    type(hour, '15');
    await fixture.whenStable();
    expect(hour.value).toBe('15');

    type(hour, '9');
    hour.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(hour.value).toBe('09');
  });
});

describe('DayPicker', () => {
  const days = [
    { id: 'MONDAY', label: 'Monday', short: 'Mon', narrow: 'M' },
    { id: 'TUESDAY', label: 'Tuesday', short: 'Tue', narrow: 'T' },
  ];

  it('reports added and removed days', async () => {
    const { fixture, host } = await render(DayPicker, {
      days,
      selected: ['MONDAY'],
      toggleLabel: 'Days',
    });
    const changed = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(changed);
    const [monday, tuesday] = host.querySelectorAll<HTMLElement>('[aria-pressed]');

    tuesday.click();
    expect(changed).toHaveBeenLastCalledWith(['MONDAY', 'TUESDAY']);

    monday.click();
    expect(changed).toHaveBeenLastCalledWith([]);
  });

  it('lists selected days in week order', async () => {
    const { host } = await render(DayPicker, {
      days,
      selected: ['TUESDAY', 'MONDAY'],
      toggleLabel: 'Days',
    });

    expect(host.textContent).toContain('Monday, Tuesday');
  });
});

describe('Snackbar', () => {
  it('keeps the live region in the DOM while empty', async () => {
    const { fixture } = await render(Snackbar, { message: null });

    expect(fixture.nativeElement.getAttribute('role')).toBe('status');
  });

  it('asks to be dismissed after its duration', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(Snackbar);
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('message', 'Done');
    fixture.componentRef.setInput('duration', 1000);
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);
    vi.useRealTimers();

    expect(dismissed).toHaveBeenCalledOnce();
  });
});

describe('OptionDialog', () => {
  const inputs = {
    open: true,
    title: 'Theme',
    cancelLabel: 'Cancel',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
    value: 'light',
  };

  it('applies a selection at once and has no confirm button', async () => {
    const { fixture, host } = await render(OptionDialog<string>, inputs);
    const selected = vi.fn();
    fixture.componentInstance.selected.subscribe(selected);

    host.querySelectorAll<HTMLElement>('[role=radio]')[1].click();

    expect(selected).toHaveBeenCalledWith('dark');
    expect(host.querySelectorAll('dialog button:not([role=radio])')).toHaveLength(1);
  });
});

describe('TextFieldDialog', () => {
  const inputs = {
    open: true,
    title: 'Name',
    label: 'Your name',
    cancelLabel: 'Cancel',
    confirmLabel: 'Confirm',
  };

  it('disables confirm until the trimmed value has text', async () => {
    const { fixture, host } = await render(TextFieldDialog, inputs);
    const input = query<HTMLInputElement>(host, 'input');

    type(input, '   ');
    await fixture.whenStable();
    expect(buttonNamed(host, 'Confirm').disabled).toBe(true);

    type(input, ' Ana ');
    await fixture.whenStable();
    expect(buttonNamed(host, 'Confirm').disabled).toBe(false);
  });

  it('confirms the trimmed value', async () => {
    const { fixture, host } = await render(TextFieldDialog, inputs);
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);

    type(query<HTMLInputElement>(host, 'input'), ' Ana ');
    await fixture.whenStable();
    buttonNamed(host, 'Confirm').click();

    expect(confirmed).toHaveBeenCalledWith('Ana');
  });

  it('restarts the draft each time it opens', async () => {
    const { fixture, host } = await render(TextFieldDialog, { ...inputs, value: 'Ana' });
    const input = query<HTMLInputElement>(host, 'input');

    type(input, 'Changed');
    await fixture.whenStable();
    fixture.componentRef.setInput('open', false);
    await fixture.whenStable();
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();

    expect(input.value).toBe('Ana');
  });
});

describe('TimeInputDialog', () => {
  it('shows the error and disables confirm while it is invalid', async () => {
    const { host } = await render(TimeInputDialog, {
      open: true,
      title: 'Window',
      fields: [{ label: 'From', value: { hour: 9, minute: 0 } }],
      labels: TIME_LABELS,
      cancelLabel: 'Cancel',
      confirmLabel: 'Confirm',
      validate: () => 'Not valid',
    });

    expect(query(host, '[role=alert]').textContent).toContain('Not valid');
    expect(buttonNamed(host, 'Confirm').disabled).toBe(true);
  });
});
