import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { Button } from './button';
import { Icon } from './icon';
import { Day, DayInfo } from '../data/task.model';

let nextId = 0;

@Component({
  selector: 'dt-day-picker',
  imports: [Button, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-2' },
  template: `
    <button
      dt-button
      type="button"
      class="w-full md:hidden"
      [attr.aria-expanded]="expanded()"
      [attr.aria-controls]="listId"
      (click)="expanded.set(!expanded())"
    >
      {{ toggleLabel() }}
    </button>
    <p class="hidden text-label-large text-on-surface-variant md:block">{{ toggleLabel() }}</p>

    <!-- Collapsed chips are invisible, not just clipped, so they leave the tab order. -->
    <div
      class="grid transition-[grid-template-rows,opacity,visibility] duration-300 md:visible md:grid-rows-[1fr] md:opacity-100"
      [class]="
        expanded() ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'
      "
      [id]="listId"
    >
      <div class="min-h-0 overflow-hidden">
        <div
          class="grid gap-3 py-1.5 md:grid-cols-7 md:gap-1"
          role="group"
          [attr.aria-label]="toggleLabel()"
        >
          @for (day of days(); track day.id) {
            <button
              type="button"
              class="relative flex min-h-8 w-full items-center gap-2 rounded-sm border px-3 py-1 text-label-large transition-colors duration-200 after:absolute after:inset-x-0 after:-inset-y-1.5 focus-visible:-outline-offset-2 md:justify-center md:gap-0.5 md:px-1"
              [class]="
                isSelected(day)
                  ? 'border-secondary-container bg-secondary-container text-on-secondary-container'
                  : 'border-outline-variant text-on-surface-variant'
              "
              [attr.aria-pressed]="isSelected(day)"
              (click)="toggle(day)"
            >
              @if (isSelected(day)) {
                <dt-icon name="check" [size]="16" />
              }
              <span class="md:sr-only">{{ day.label }}</span>
              <span class="hidden md:inline" aria-hidden="true">{{ day.short }}</span>
            </button>
          }
        </div>
      </div>
    </div>

    <p class="min-h-4 text-label-medium text-secondary">{{ summary() }}</p>
  `,
})
export class DayPicker {
  readonly days = input.required<readonly DayInfo[]>();
  readonly selected = input.required<Day[]>();
  readonly toggleLabel = input.required<string>();

  readonly selectedChange = output<Day[]>();

  protected readonly listId = `dt-day-picker-${nextId++}`;
  protected readonly expanded = signal(false);
  protected readonly summary = computed(() =>
    this.days()
      .filter((day) => this.isSelected(day))
      .map((day) => day.label)
      .join(', '),
  );

  protected isSelected(key: DayInfo): boolean {
    return this.selected().includes(key.id);
  }

  protected toggle(key: DayInfo): void {
    const selected = this.selected();
    this.selectedChange.emit(
      selected.includes(key.id) ? selected.filter((day) => day !== key.id) : [...selected, key.id],
    );
  }
}
