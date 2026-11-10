import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Button, IconButton } from './button';
import { Icon } from './icon';

@Component({
  selector: 'dt-hint-box',
  imports: [Button, Icon, IconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'relative flex items-start gap-3 overflow-hidden rounded-lg border border-tertiary/35 ' +
      'bg-tertiary-container/55 py-3 pr-1 pl-[17px] lg:items-center lg:py-1.5',
  },
  template: `
    <span class="absolute inset-y-0 left-0 w-[5px] bg-tertiary" aria-hidden="true"></span>

    <span
      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-tertiary text-on-tertiary"
    >
      <dt-icon name="lightbulb" [size]="20" />
    </span>

    <div
      class="flex min-w-0 flex-1 flex-col items-start gap-1 lg:flex-row lg:items-center lg:gap-4"
    >
      <div class="flex min-w-0 flex-col gap-1 lg:flex-1 lg:gap-0">
        <p class="text-title-small text-on-tertiary-container">{{ title() }}</p>
        <p class="text-body-small text-on-tertiary-container/80">{{ body() }}</p>
      </div>
      @if (actionLabel(); as actionLabel) {
        <button
          dt-button
          type="button"
          variant="text"
          tone="tertiary"
          class="-ml-3 lg:ml-0"
          (click)="action.emit()"
        >
          {{ actionLabel }}
        </button>
      }
    </div>

    <button
      dt-icon-button
      type="button"
      class="text-on-tertiary-container"
      [attr.aria-label]="closeLabel()"
      (click)="dismiss.emit()"
    >
      <dt-icon name="close" [size]="20" />
    </button>
  `,
})
export class HintBox {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly closeLabel = input.required<string>();
  readonly actionLabel = input<string>();

  readonly action = output<void>();
  readonly dismiss = output<void>();
}
