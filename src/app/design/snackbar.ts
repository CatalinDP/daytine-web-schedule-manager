import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';

import { Button } from './button';

const DEFAULT_DURATION_MS = 6000;

/**
 * The host stays in the DOM while empty, because screen readers only announce
 * changes inside a live region that already exists.
 */
@Component({
  selector: 'dt-snackbar',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    class: 'block',
    '[class]':
      "floating() ? 'fixed inset-x-4 z-30 lg:right-auto lg:bottom-6 lg:left-6 lg:w-96 ' + (lifted() ? 'bottom-37' : 'bottom-23') : ''",
  },
  template: `
    @if (message(); as message) {
      <div
        class="flex min-h-12 items-center gap-2 rounded-xs bg-inverse-surface py-1 pr-2 pl-4 text-body-medium text-inverse-on-surface shadow-card"
      >
        <p class="min-w-0 flex-1 py-2">{{ message }}</p>
        @if (actionLabel(); as actionLabel) {
          <button
            dt-button
            type="button"
            variant="text"
            tone="inherit"
            class="text-inverse-primary"
            (click)="action.emit()"
          >
            {{ actionLabel }}
          </button>
        }
      </div>
    }
  `,
})
export class Snackbar {
  readonly message = input<string | null>(null);
  readonly actionLabel = input<string>();
  /** False renders in place, for previews. */
  readonly floating = input(true);
  /** Clears a control fixed above the nav bar on small screens. */
  readonly lifted = input(false);
  /** Time before `dismissed` fires. Zero keeps it open. */
  readonly duration = input(DEFAULT_DURATION_MS);

  readonly action = output<void>();
  readonly dismissed = output<void>();

  constructor() {
    effect((onCleanup) => {
      const duration = this.duration();
      if (!this.message() || duration === 0) return;

      const timer = setTimeout(() => this.dismissed.emit(), duration);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
