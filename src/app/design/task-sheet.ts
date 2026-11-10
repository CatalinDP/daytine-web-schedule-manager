import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';

import { Button } from './button';
import { DayPicker } from './day-picker';
import { Modal } from './modal';
import { TextField } from './text-field';
import { TimeInput, TimeInputLabels } from './time-input';
import { DayInfo, Task } from '../data/task.model';

export interface TaskSheetLabels {
  readonly createTitle: string;
  readonly editTitle: string;
  readonly name: string;
  readonly start: string;
  readonly end: string;
  readonly days: string;
  readonly cancel: string;
  readonly save: string;
  readonly delete: string;
  readonly time: TimeInputLabels;
}

let nextId = 0;

// Form to create or edit a task. Bottom sheet on mobile, centered dialog on bigger screens.
@Component({
  selector: 'dt-task-sheet',
  imports: [Button, DayPicker, Modal, TextField, TimeInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      class="mx-0 mt-auto mb-0 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-xl bg-surface-container-low text-on-surface transition-transform duration-300 backdrop:bg-scrim/40 starting:open:translate-y-full md:m-auto md:w-[calc(100%-2rem)] md:max-w-[35rem] md:rounded-xl md:transition-none"
      [dtModal]="open()"
      [attr.aria-labelledby]="titleId"
      (dismissRequested)="cancelled.emit()"
    >
      <div class="flex flex-col gap-4 px-6 pb-6">
        <h2 class="pt-6 text-headline-small" [id]="titleId">
          {{ task() ? labels().editTitle : labels().createTitle }}
        </h2>

        <dt-text-field
          [label]="labels().name"
          [value]="draft().name"
          (valueChange)="patch({ name: $event })"
        />

        <div class="flex flex-col gap-4 md:flex-row">
          <dt-time-input
            class="min-w-0 flex-1"
            [label]="labels().start"
            [labels]="labels().time"
            [value]="draft().start"
            (valueChange)="patch({ start: $event })"
          />
          <dt-time-input
            class="min-w-0 flex-1"
            [label]="labels().end"
            [labels]="labels().time"
            [value]="draft().end"
            (valueChange)="patch({ end: $event })"
          />
        </div>

        <dt-day-picker
          [days]="days()"
          [selected]="draft().days"
          [toggleLabel]="labels().days"
          (selectedChange)="patch({ days: $event })"
        />

        <div class="flex flex-wrap items-center justify-end gap-2">
          @if (task(); as t) {
            <button
              dt-button
              type="button"
              variant="text"
              tone="error"
              class="mr-auto"
              (click)="delete.emit(t.id)"
            >
              {{ labels().delete }}
            </button>
          }
          <button dt-button type="button" variant="text" (click)="cancelled.emit()">
            {{ labels().cancel }}
          </button>
          <button dt-button type="button" [disabled]="!canSave()" (click)="saved.emit(draft())">
            {{ labels().save }}
          </button>
        </div>
      </div>
    </dialog>
  `,
})
export class TaskSheet {
  readonly open = input.required<boolean>();
  readonly task = input<Task | null>(null);
  readonly emptyTask = input.required<Task>();
  readonly days = input.required<readonly DayInfo[]>();
  readonly labels = input.required<TaskSheetLabels>();

  readonly saved = output<Task>();
  readonly cancelled = output<void>();
  readonly delete = output<string>();

  protected readonly titleId = `dt-task-sheet-title-${nextId++}`;

  // Resets the form every time the sheet opens
  protected readonly draft = linkedSignal({
    source: this.open,
    computation: () => this.task() ?? this.emptyTask(),
  });
  protected readonly canSave = computed(() => this.draft().name.trim() !== '');

  protected patch(change: Partial<Task>): void {
    this.draft.update((draft) => ({ ...draft, ...change }));
  }
}
