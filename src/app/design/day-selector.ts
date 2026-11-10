import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconButton } from './button';
import { Icon } from './icon';

@Component({
  selector: 'dt-day-selector',
  imports: [Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex min-h-12 items-center justify-between gap-2 rounded-md bg-primary-container px-2 ' +
      'text-on-primary-container',
  },
  template: `
    <button
      dt-icon-button
      type="button"
      [attr.aria-label]="previousLabel()"
      (click)="previous.emit()"
    >
      <dt-icon name="arrow_left" />
    </button>
    <p class="min-w-0 text-center text-title-medium" aria-live="polite">{{ dayName() }}</p>
    <button dt-icon-button type="button" [attr.aria-label]="nextLabel()" (click)="next.emit()">
      <dt-icon name="arrow_right" />
    </button>
  `,
})
export class DaySelector {
  readonly dayName = input.required<string>();
  readonly previousLabel = input.required<string>();
  readonly nextLabel = input.required<string>();

  readonly previous = output<void>();
  readonly next = output<void>();
}
