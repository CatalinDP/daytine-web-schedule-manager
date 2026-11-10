import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconButton } from './button';
import { Icon } from './icon';

export interface WeekBoardTask {
  readonly id: string;
  readonly name: string;
  /** Start time. The full range lives in the edit form. */
  readonly time: string;
  readonly done: boolean;
}

export interface WeekBoardDay {
  readonly key: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly date: number;
  readonly isToday: boolean;
  readonly tasks: readonly WeekBoardTask[];
}

export interface WeekBoardTaskEvent {
  readonly dayIndex: number;
  readonly taskId: string;
}

/** The whole week in seven columns, for screens wide enough to show it. */
@Component({
  selector: 'dt-week-board',
  imports: [Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid grid-cols-7 gap-2' },
  template: `
    @for (day of days(); track day.key; let dayIndex = $index) {
      <section
        class="flex min-h-[calc(100dvh-12.5rem)] min-w-0 flex-col gap-2 rounded-lg p-1.5"
        [class]="day.isToday ? 'bg-primary-container/40' : 'bg-surface-container-low'"
        [attr.aria-label]="day.label"
      >
        <h2 class="flex items-center gap-2 px-1.5 pt-1.5 pb-1" aria-hidden="true">
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full text-title-medium"
            [class]="day.isToday ? 'bg-primary text-on-primary' : 'text-on-surface'"
          >
            {{ day.date }}
          </span>
          <span class="min-w-0 text-label-large text-on-surface-variant">{{ day.shortLabel }}</span>
        </h2>

        <ul class="flex flex-col gap-1.5">
          @for (task of day.tasks; track task.id) {
            <li
              class="group relative rounded-md border border-outline-variant bg-on-secondary transition-colors duration-200 hover:border-outline"
            >
              <button
                type="button"
                class="block w-full rounded-md px-2 pt-3 pb-2 text-left focus-visible:-outline-offset-2"
                (click)="edit.emit({ dayIndex, taskId: task.id })"
              >
                <span class="block pl-7 text-label-medium text-on-surface-variant">
                  {{ task.time }}
                </span>
                <span class="mt-2 block text-label-large text-on-surface">{{ task.name }}</span>
              </button>

              <span class="absolute top-0 left-0 flex size-11 items-center justify-center">
                <input
                  type="checkbox"
                  class="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  [checked]="task.done"
                  [disabled]="!day.isToday"
                  [attr.aria-label]="task.name"
                  (change)="onToggle($event, dayIndex, task.id)"
                />
                <span
                  class="-translate-x-1.5 -translate-y-px flex size-[18px] items-center justify-center rounded-xs border-2 border-outline text-on-primary transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:opacity-40"
                >
                  @if (task.done) {
                    <dt-icon name="check" [size]="14" />
                  }
                </span>
              </span>

              <button
                dt-icon-button
                type="button"
                class="absolute top-0 right-0 text-error opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                [attr.aria-label]="deleteLabel()(task.name)"
                (click)="delete.emit({ dayIndex, taskId: task.id })"
              >
                <dt-icon name="delete" [size]="18" />
              </button>
            </li>
          }
        </ul>

        <button
          type="button"
          class="flex min-h-11 items-center justify-center gap-1 rounded-md text-label-medium text-primary transition-colors duration-200 hover:bg-primary/10"
          [attr.aria-label]="addLabel()(day.label)"
          (click)="add.emit(dayIndex)"
        >
          <dt-icon name="add_circle" [size]="16" />
          {{ addText() }}
        </button>
      </section>
    }
  `,
})
export class WeekBoard {
  readonly days = input.required<readonly WeekBoardDay[]>();
  /** Short visible text of each column's add button. */
  readonly addText = input.required<string>();
  /** Accessible name of a column's add button, from the day label. */
  readonly addLabel = input.required<(day: string) => string>();
  readonly deleteLabel = input.required<(name: string) => string>();

  readonly toggled = output<WeekBoardTaskEvent & { readonly done: boolean }>();
  readonly edit = output<WeekBoardTaskEvent>();
  readonly delete = output<WeekBoardTaskEvent>();
  readonly add = output<number>();

  protected onToggle(event: Event, dayIndex: number, taskId: string): void {
    const done = (event.target as HTMLInputElement).checked;
    this.toggled.emit({ dayIndex, taskId, done });
  }
}
